import type { LngLat, LngLatBounds } from "mapbox-gl"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import type { MapRef } from "react-map-gl/mapbox"
import type { Category, Sound } from "@/domain/sound"
import { haversineDistanceMeters } from "@/lib/geo"
import { clampValue, syncCanvasSize } from "../../lib/mapCanvas"
import {
  drawCanvasRipple,
  FOG_RIPPLE_CONFIG,
  SOUND_MARKER_RIPPLE_CONFIG,
} from "../../lib/ripple"
import { usePersistenceStore } from "../../persistence"
import { fogCanvas, fogOverlayContainer } from "./MapFogOverlay.css"
import { drawOuterFogBoundary, drawReveals } from "./renderer"
import {
  collectCellsInBounds,
  collectCellsInRadius,
  createFogGrid,
  cullRevealsToViewport,
  projectRevealsToScreen,
  resolvePersistedReveals,
} from "./spatial"
import { createTextureCache } from "./texture"
import type {
  FogGrid,
  RevealPoint,
  RevealScreenSpace,
  ViewportBounds,
} from "./types"

/**
 * MapFogOverlay implements a "fog of war" mechanic for the Thames map.
 *
 * Design Goals:
 * - Fully obscure the map (100% opaque fog) to encourage exploration
 * - Reveal areas progressively as the purple marker moves along Thames' paths
 * - Persist revealed areas across sessions using localStorage
 * - Show sound markers through the fog with ripple animation to guide users
 *
 * Technical Approach:
 * - Uses native Canvas 2D (not WebGL/Pixi.js) for simplicity and broad compatibility
 * - Stores geographic coordinates (lat/lng/radiusMeters) for zoom-independent persistence
 * - Uses "destination-out" composite operation to punch holes in the fog
 * - Runs at 60fps via requestAnimationFrame for smooth ripple animations
 * - Limits stored reveals to 200 points to prevent unbounded memory growth
 *
 * Two-Bound System:
 * - Movement bounds (inner): Geographic area where avatar can move and reveal fog
 * - Camera bounds (outer): Visible viewport - areas outside movement bounds stay fogged
 * - This creates a soft boundary: user can see beyond movement bounds but can't explore there
 */

interface MapFogOverlayProps {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly movementBounds: LngLatBounds // Inner bounds: where avatar can move and reveal
  readonly intensity?: number // 0-1, controls fog opacity (1.0 = fully opaque)
  readonly revealSize?: number // Pixel radius of reveal circles
  readonly enabled?: boolean
  readonly sounds?: ReadonlyArray<Sound> // Sound markers to show as hints through fog
  readonly filters?: readonly Category[] // Active category filters
}

export interface MapFogOverlayHandle {
  restoreFog: () => void
  revealMap: () => void
  trackUserPosition: (position: LngLat) => void
}

// Constants
const RIPPLE_CYCLE_MS = SOUND_MARKER_RIPPLE_CONFIG.maxAge * 1000 * 2
const FOG_RIPPLE_COUNT = 1
const NODE_SIDE_IN_CELLS = 4 // Visual node spans roughly four grid cells in the reveal mesh
const MIN_CELL_SIZE_METERS = 80
const MAX_CELL_SIZE_METERS = 220
const TARGET_GRID_CELLS = 1600

const computeCellMetrics = (bounds: LngLatBounds) => {
  const diagonalMeters = haversineDistanceMeters(
    bounds.getSouthWest(),
    bounds.getNorthEast(),
  )
  const idealCellSize = diagonalMeters / Math.sqrt(TARGET_GRID_CELLS)
  const cellSize = clampValue(
    idealCellSize,
    MIN_CELL_SIZE_METERS,
    MAX_CELL_SIZE_METERS,
  )

  return {
    cellSize,
    visualRadius: (cellSize * NODE_SIDE_IN_CELLS) / 2,
  }
}

const serializeRevealsForPersistence = (entries: readonly RevealPoint[]) =>
  entries.map((entry) => ({
    lng: entry.lng,
    lat: entry.lat,
  }))

export const MapFogOverlay = forwardRef<
  MapFogOverlayHandle,
  MapFogOverlayProps
>(
  (
    {
      mapRef,
      movementBounds,
      intensity = 0.85,
      revealSize = 30,
      enabled = true,
      sounds = [],
      filters = [],
    },
    ref,
  ) => {
    // === REFS FOR CANVAS AND RENDERING ===
    // Using refs (not state) to avoid triggering re-renders on every frame
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const resizeObserverRef = useRef<ResizeObserver | null>(null)

    // === TEXTURE CACHE ===
    // Mutable cache for pre-rendered reveal textures (performance optimization)
    const textureCacheRef = useRef(createTextureCache())

    // === MARKER POSITION TRACKING ===
    // Track the last marker position to detect movement
    const lastMarkerPosRef = useRef<LngLat | null>(null)

    // === CAMERA BOUNDS TRACKING ===
    // Track visible viewport bounds for outer fog boundary
    const [cameraBounds, setCameraBounds] = useState<LngLatBounds | null>(null)

    // === VIEWPORT SIZE ===
    // Store as state so canvas can resize when viewport changes
    const [size, setSize] = useState({ width: 0, height: 0 })
    const updateSize = useCallback(() => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      // Only update if size actually changed (prevents infinite loops)
      setSize((prev) => {
        if (prev.width === rect.width && prev.height === rect.height) {
          return prev
        }
        return {
          width: rect.width,
          height: rect.height,
        }
      })
    }, [])

    // === REVEAL PERSISTENCE ===
    // Revealed grid cells (capped to prevent unbounded growth)
    const gridRef = useRef<FogGrid | null>(null)
    const revealsRef = useRef<Map<number, RevealPoint>>(new Map())
    const revealOrderRef = useRef<number[]>([])
    const revealedBitmapRef = useRef<Uint8Array | null>(null)
    const dirtyKeysRef = useRef<Set<number>>(new Set())
    const revealsBufferRef = useRef<RevealPoint[]>([])
    const visibleRevealsBufferRef = useRef<RevealPoint[]>([])
    const screenRevealsBufferRef = useRef<RevealScreenSpace[]>([])
    // Timeout for debounced localStorage writes (avoid blocking on every mouse move)
    const maxRevealCellsRef = useRef<number | null>(null)

    const persistReveals = useCallback(() => {
      if (dirtyKeysRef.current.size === 0) return

      const maxCells = maxRevealCellsRef.current
      const limit =
        maxCells && maxCells > 0 ? maxCells : revealOrderRef.current.length
      const orderedKeys = revealOrderRef.current.slice(-limit)
      const persistedEntries = orderedKeys
        .map((key) => revealsRef.current.get(key))
        .filter((entry): entry is RevealPoint => Boolean(entry))
      usePersistenceStore
        .getState()
        .setFogReveals(serializeRevealsForPersistence(persistedEntries))
      dirtyKeysRef.current.clear()
    }, [])
    // Memoized Mapbox map accessor
    const getMap = useCallback(() => mapRef.current?.getMap(), [mapRef])
    const ensureGrid = useCallback((): FogGrid | null => {
      if (gridRef.current) {
        return gridRef.current
      }

      const map = getMap()
      const bounds = movementBounds ?? map?.getBounds()
      if (!bounds) return null

      const metrics = computeCellMetrics(bounds)
      const grid = createFogGrid(bounds, metrics.cellSize, metrics.visualRadius)
      gridRef.current = grid
      revealedBitmapRef.current = new Uint8Array(grid.width * grid.height)
      maxRevealCellsRef.current = grid.width * grid.height
      return grid
    }, [getMap, movementBounds])
    const addReveals = useCallback(
      (cells: readonly RevealPoint[]) => {
        if (cells.length === 0) return

        const revealMap = revealsRef.current
        const order = revealOrderRef.current
        const bitmap = revealedBitmapRef.current
        let added = false

        for (const cell of cells) {
          if (bitmap && bitmap[cell.key] === 1) continue
          if (revealMap.has(cell.key)) continue
          revealMap.set(cell.key, cell)
          order.push(cell.key)
          if (bitmap) {
            bitmap[cell.key] = 1
          }
          dirtyKeysRef.current.add(cell.key)
          added = true
        }

        if (!added) return

        const maxCells = maxRevealCellsRef.current
        while (maxCells && maxCells > 0 && order.length > maxCells) {
          const oldest = order.shift()
          if (!oldest) break
          revealMap.delete(oldest)
          if (bitmap) {
            bitmap[oldest] = 0
          }
          dirtyKeysRef.current.add(oldest)
        }

        persistReveals()
      },
      [persistReveals],
    )

    // === EFFECT: RESIZE OBSERVER ===
    /**
     * Watch container size changes and update canvas dimensions.
     * Needed for responsive behavior when window resizes or map container changes.
     * Stores observer ref to prevent memory leaks on strict mode double-mounting.
     */
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      updateSize()
      const observer = new ResizeObserver(updateSize)
      resizeObserverRef.current = observer
      observer.observe(container)

      return () => {
        observer.disconnect()
        resizeObserverRef.current = null
      }
    }, [updateSize])

    // === EFFECT: LOAD PERSISTED REVEALS ===
    /**
     * Restore persisted reveals once a grid can be created.
     * Legacy points are snapped to the grid so geographic coverage stays stable.
     */
    useEffect(() => {
      const grid = ensureGrid()
      if (!grid) return

      const storedReveals = usePersistenceStore.getState().fogReveals
      const persistLimit =
        maxRevealCellsRef.current && maxRevealCellsRef.current > 0
          ? maxRevealCellsRef.current
          : storedReveals.length
      const loaded = storedReveals.slice(-persistLimit)

      const resolved = resolvePersistedReveals(
        grid,
        loaded,
        grid.visualCellRadiusMeters,
        movementBounds,
      )

      const nextMap = new Map<number, RevealPoint>()
      const order: number[] = []

      for (const reveal of resolved) {
        if (nextMap.has(reveal.key)) continue
        nextMap.set(reveal.key, reveal)
        order.push(reveal.key)
        if (revealedBitmapRef.current) {
          revealedBitmapRef.current[reveal.key] = 1
        }
      }

      revealOrderRef.current = order
      revealsRef.current = nextMap
    }, [ensureGrid, movementBounds])

    const revealAtPosition = useCallback(
      (position: LngLat) => {
        const map = getMap()
        if (!map) return

        const grid = ensureGrid()
        if (!grid) return

        const screenPosition = map.project(position)
        const comparison = map.unproject([
          screenPosition.x + revealSize,
          screenPosition.y,
        ])
        const revealRadiusMeters = position.distanceTo(comparison)

        const cells = collectCellsInRadius(
          grid,
          position,
          revealRadiusMeters,
          grid.visualCellRadiusMeters,
          movementBounds,
        )

        addReveals(cells)
        lastMarkerPosRef.current = position
      },
      [addReveals, ensureGrid, getMap, movementBounds, revealSize],
    )

    // === IMPERATIVE HANDLE: EXPOSE RESTORE FOG FUNCTION ===
    /**
     * Expose restoreFog function to parent component for debug use.
     * Clears all reveals from memory and localStorage, resetting to initial fog state.
     */
    useImperativeHandle(
      ref,
      () => ({
        restoreFog: () => {
          revealsRef.current = new Map()
          revealOrderRef.current = []
          if (revealedBitmapRef.current) {
            revealedBitmapRef.current.fill(0)
          }
          dirtyKeysRef.current.clear()
          lastMarkerPosRef.current = null
          usePersistenceStore.getState().clearFogReveals()
        },
        revealMap: () => {
          const grid = ensureGrid()
          if (!grid) return

          const map = getMap()
          const bounds = movementBounds ?? map?.getBounds()
          if (!bounds) return

          const cells = collectCellsInBounds(
            grid,
            bounds,
            grid.visualCellRadiusMeters,
          )

          revealsRef.current = new Map()
          revealOrderRef.current = []
          if (revealedBitmapRef.current) {
            revealedBitmapRef.current.fill(0)
          }
          dirtyKeysRef.current.clear()
          addReveals(cells)
          lastMarkerPosRef.current = bounds.getCenter()
        },
        trackUserPosition: (position: LngLat) => {
          revealAtPosition(position)
        },
      }),
      [addReveals, ensureGrid, getMap, movementBounds, revealAtPosition],
    )

    // === EFFECT: MAP CHANGE TRACKING ===
    /**
     * Update canvas size and camera bounds when map resizes or moves.
     * Mapbox may resize its container during pan/zoom operations.
     * Camera bounds define the outer fog boundary (visible viewport).
     */
    useEffect(() => {
      const map = mapRef.current?.getMap()
      if (!map) return

      const updateBounds = () => {
        const bounds = map.getBounds()
        if (bounds) {
          setCameraBounds(bounds)
        }
      }

      // Initialize bounds
      updateBounds()

      // Update on map interactions
      map.on("resize", updateSize)
      map.on("move", updateBounds)
      map.on("zoom", updateBounds)

      return () => {
        map.off("resize", updateSize)
        map.off("move", updateBounds)
        map.off("zoom", updateBounds)
      }
    }, [mapRef, updateSize])

    // === EFFECT: RENDER LOOP ===
    /**
     * Main rendering loop - draws fog and reveals at 60fps.
     *
     * Rendering Strategy:
     * 1. Fill entire canvas with opaque black fog (1.0 opacity)
     * 2. Draw semi-transparent marker hints (0.5 opacity) with ripple animation
     * 3. Use "destination-out" composite mode to punch transparent holes
     * 4. Draw persistent reveals (from marker movement trail)
     *
     * Why destination-out:
     * - This composite mode erases pixels from the fog layer
     * - Allows smooth radial gradient falloff at reveal edges
     * - More efficient than redrawing entire fog with complex masks
     *
     * Device Pixel Ratio Handling:
     * - Canvas internal size scaled by DPR for sharp rendering on retina displays
     * - CSS size stays in logical pixels for correct layout
     * - Transform matrix scaled to match DPR for correct coordinate space
     */
    useEffect(() => {
      if (!enabled) return
      const canvas = canvasRef.current
      if (!canvas || size.width === 0 || size.height === 0) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const drawFrame = () => {
        const { width, height } = size

        // Handle retina displays - scale internal canvas resolution
        syncCanvasSize(canvas, ctx, width, height)

        // STEP 1: Fill entire canvas with opaque fog (no clearRect needed - we fill the entire canvas)
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, intensity)})`
        ctx.fillRect(0, 0, width, height)

        const applyReveal = () => {
          const map = getMap()
          if (!map) return

          // STEP 2: Draw marker hints through the fog
          // Ripple effect animation to guide users to sound locations
          ctx.globalCompositeOperation = "source-over"

          const time = performance.now()
          const currentZoom = map.getZoom()

          for (const sound of sounds) {
            // Skip filtered-out markers
            if (filters.length > 0 && !filters.includes(sound.category)) {
              continue
            }

            const screen = map.project(sound.coordinate)

            // Draw ripple hints to guide users toward obscured sounds
            for (
              let rippleIndex = 0;
              rippleIndex < FOG_RIPPLE_COUNT;
              rippleIndex += 1
            ) {
              drawCanvasRipple(
                ctx,
                screen.x,
                screen.y,
                time,
                rippleIndex,
                RIPPLE_CYCLE_MS,
                currentZoom,
                FOG_RIPPLE_CONFIG,
              )
            }
          }

          // STEP 3: Draw persistent reveals (optimized with viewport culling + texture cache)
          // Using geographic coordinates so they stay in place during pan/zoom
          const allReveals = revealsBufferRef.current
          allReveals.length = 0
          revealsRef.current.forEach((reveal) => {
            allReveals.push(reveal)
          })
          if (allReveals.length > 0) {
            // Optimization 1: Cull reveals outside viewport
            const viewport: ViewportBounds = { width, height }
            const visibleReveals = cullRevealsToViewport(
              allReveals,
              map,
              viewport,
              currentZoom,
              visibleRevealsBufferRef.current,
            )

            if (visibleReveals.length > 0) {
              // Optimization 2: Project to screen space once
              const screenReveals = projectRevealsToScreen(
                visibleReveals,
                map,
                currentZoom,
                screenRevealsBufferRef.current,
              )

              // Optimization 3: Render using cached textures
              drawReveals(ctx, textureCacheRef.current, screenReveals)
            }
          }

          // STEP 4: Draw outer fog boundary (areas outside movement bounds)
          // This keeps areas beyond the allowed movement zone obscured
          if (cameraBounds) {
            ctx.globalCompositeOperation = "source-over"
            drawOuterFogBoundary(
              ctx,
              map,
              movementBounds,
              width,
              height,
              intensity,
            )
          }
        }

        applyReveal()

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(drawFrame)
      }

      drawFrame()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      }
    }, [
      size,
      intensity,
      enabled,
      getMap,
      sounds,
      filters,
      cameraBounds,
      movementBounds,
    ])

    // === EFFECT: CLEANUP ===
    /**
     * Cancel pending localStorage writes on unmount.
     * Prevents memory leaks from dangling requestAnimationFrame callbacks.
     */
    if (!enabled) return null

    return (
      <div
        ref={containerRef}
        className={fogOverlayContainer}
        data-testid="map-fog-overlay"
      >
        <canvas ref={canvasRef} className={fogCanvas} />
      </div>
    )
  },
)

MapFogOverlay.displayName = "MapFogOverlay"
