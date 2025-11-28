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
import { projectToScreen, syncCanvasSize } from "../../lib/mapCanvas"
import { drawCanvasRipple, FOG_RIPPLE_CONFIG } from "../../lib/ripple"
import { usePersistenceStore } from "../../persistence"
import { fogCanvas, fogOverlayContainer } from "./MapFogOverlay.css"
import { drawOuterFogBoundary, drawReveals } from "./renderer"
import { cullRevealsToViewport, projectRevealsToScreen } from "./spatial"
import { createTextureCache } from "./texture"
import type { RevealPoint, ViewportBounds } from "./types"

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
const RIPPLE_CYCLE_MS = 8000 // 8-second cycle (4x slower than base 2s)
const FIXED_REVEAL_RADIUS_METERS = 3000 // Fixed reveal radius in meters, independent of zoom
const MAX_REVEALS = 200 // Maximum number of reveals to store
const PERSIST_DEBOUNCE_MS = 400

const computeBoundsRevealRadius = (bounds: LngLatBounds, center: LngLat) => {
  const corners = [
    bounds.getNorthEast(),
    bounds.getNorthWest(),
    bounds.getSouthEast(),
    bounds.getSouthWest(),
  ]

  return corners.reduce((maxRadius, corner) => {
    const distance = haversineDistanceMeters(center, corner)
    return Math.max(maxRadius, distance)
  }, 0)
}

export const MapFogOverlay = forwardRef<
  MapFogOverlayHandle,
  MapFogOverlayProps
>(
  (
    {
      mapRef,
      movementBounds,
      intensity = 0.85,
      revealSize = 200,
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
    // Array of all revealed points (capped to prevent unbounded growth)
    const revealsRef = useRef<RevealPoint[]>([])
    // Timeout for debounced localStorage writes (avoid blocking on every mouse move)
    const persistTimeoutRef = useRef<number | null>(null)
    // Last reveal point for distance-based deduplication (prevents spam)
    const lastRevealRef = useRef<RevealPoint | null>(null)

    /**
     * Debounced localStorage write using modular persistence layer.
     * Uses a short timeout to batch writes and avoid main-thread stalls during animations.
     */
    const persistReveals = useCallback(() => {
      if (persistTimeoutRef.current) {
        window.clearTimeout(persistTimeoutRef.current)
      }

      persistTimeoutRef.current = window.setTimeout(() => {
        usePersistenceStore
          .getState()
          .setFogReveals(revealsRef.current.slice(-MAX_REVEALS))
        persistTimeoutRef.current = null
      }, PERSIST_DEBOUNCE_MS)
    }, [])
    // Memoized Mapbox map accessor
    const getMap = useCallback(() => mapRef.current?.getMap(), [mapRef])

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
     * On mount, restore previously revealed areas from localStorage using modular persistence layer.
     * Uses defensive parsing to handle corrupted or old data gracefully.
     * Only runs once on mount (empty deps array).
     */
    useEffect(() => {
      const loaded = usePersistenceStore
        .getState()
        .fogReveals.slice(-MAX_REVEALS)
      revealsRef.current = [...loaded]
      lastRevealRef.current = loaded[loaded.length - 1] ?? null
    }, [])

    const revealAtPosition = useCallback(
      (position: LngLat) => {
        const map = getMap()
        if (!map) return

        const last = lastMarkerPosRef.current
        if (last) {
          const lastScreen = projectToScreen(map, last.lng, last.lat)
          const currentScreen = projectToScreen(map, position.lng, position.lat)
          const distance = Math.hypot(
            currentScreen.x - lastScreen.x,
            currentScreen.y - lastScreen.y,
          )

          const threshold = revealSize * 0.35
          if (distance < threshold) {
            return
          }
        }

        const newReveal: RevealPoint = {
          lng: position.lng,
          lat: position.lat,
          radiusMeters: FIXED_REVEAL_RADIUS_METERS,
        }

        revealsRef.current = [...revealsRef.current, newReveal].slice(
          -MAX_REVEALS,
        )
        lastRevealRef.current = newReveal
        lastMarkerPosRef.current = position
        persistReveals()
      },
      [getMap, persistReveals, revealSize],
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
          revealsRef.current = []
          lastRevealRef.current = null
          lastMarkerPosRef.current = null
          usePersistenceStore.getState().clearFogReveals()
        },
        revealMap: () => {
          const map = getMap()

          const bounds = movementBounds ?? map?.getBounds()
          if (!bounds) return
          const center = bounds.getCenter()
          const coverageRadius = Math.max(
            FIXED_REVEAL_RADIUS_METERS,
            computeBoundsRevealRadius(bounds, center),
          )

          const reveal: RevealPoint = {
            lng: center.lng,
            lat: center.lat,
            radiusMeters: coverageRadius,
          }

          revealsRef.current = [reveal]
          lastRevealRef.current = reveal
          lastMarkerPosRef.current = center
          persistReveals()
        },
        trackUserPosition: (position: LngLat) => {
          revealAtPosition(position)
        },
      }),
      [getMap, movementBounds, persistReveals, revealAtPosition],
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

            const screen = projectToScreen(
              map,
              sound.coordinates.lng,
              sound.coordinates.lat,
            )

            // Draw 2 ripples with offset phases for continuous effect
            for (let rippleIndex = 0; rippleIndex < 2; rippleIndex++) {
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
          const allReveals = revealsRef.current
          if (allReveals.length > 0) {
            // Optimization 1: Cull reveals outside viewport
            const viewport: ViewportBounds = { width, height }
            const visibleReveals = cullRevealsToViewport(
              allReveals,
              map,
              viewport,
              currentZoom,
            )

            // Optimization 2: Project to screen space once
            const screenReveals = projectRevealsToScreen(
              visibleReveals,
              map,
              currentZoom,
            )

            // Optimization 3: Render using cached textures
            drawReveals(ctx, textureCacheRef.current, screenReveals)
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
    useEffect(
      () => () => {
        if (persistTimeoutRef.current) {
          window.clearTimeout(persistTimeoutRef.current)
        }
      },
      [],
    )

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
