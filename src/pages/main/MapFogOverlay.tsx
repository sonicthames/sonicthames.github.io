import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import type { MapRef } from "react-map-gl/mapbox"
import type { Category, Sound } from "../../domain/base"
import { fogCanvas, fogOverlayContainer } from "./MapFogOverlay.css"

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
 */

interface MapFogOverlayProps {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly intensity?: number // 0-1, controls fog opacity (1.0 = fully opaque)
  readonly revealSize?: number // Pixel radius of reveal circles
  readonly enabled?: boolean
  readonly userPosition?: { lat: number; lng: number } // Initial reveal at user position
  readonly sounds?: ReadonlyArray<Sound> // Sound markers to show as hints through fog
  readonly filters?: readonly Category[] // Active category filters
}

export interface MapFogOverlayHandle {
  restoreFog: () => void
}

/**
 * RevealPoint stores where the user has explored.
 * Uses geographic coordinates so reveals stay in the same location on the map
 * regardless of zoom/pan operations.
 */
type RevealPoint = {
  readonly lng: number // Longitude (geographic coordinate)
  readonly lat: number // Latitude (geographic coordinate)
  readonly radiusMeters: number // Radius in meters (geographic distance)
}

const STORAGE_KEY = "sonic-thames-map-fog-reveals"
const BASE_CYCLE_MS = 2000 // Base animation cycle duration in milliseconds
const RIPPLE_FREQUENCY_DIVISOR = 4 // Ripple cycle is 1/4 frequency (4x slower)
const FIXED_REVEAL_RADIUS_METERS = 3000 // Fixed reveal radius in meters, independent of zoom

export const MapFogOverlay = forwardRef<
  MapFogOverlayHandle,
  MapFogOverlayProps
>(
  (
    {
      mapRef,
      intensity = 0.85,
      revealSize = 200,
      enabled = true,
      userPosition,
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

    // === MARKER POSITION TRACKING ===
    // Track the last marker position to detect movement
    const lastMarkerPosRef = useRef<{ lat: number; lng: number } | null>(null)

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
    // Array of all revealed points (capped at 200 to prevent unbounded growth)
    const revealsRef = useRef<RevealPoint[]>([])
    // Timeout for debounced localStorage writes (avoid blocking on every mouse move)
    const persistTimeoutRef = useRef<number | null>(null)
    // Last reveal point for distance-based deduplication (prevents spam)
    const lastRevealRef = useRef<RevealPoint | null>(null)
    // Track if initial user position reveal has been created
    const initialRevealCreatedRef = useRef(false)

    /**
     * Debounced localStorage write.
     * Uses requestAnimationFrame instead of setTimeout for better frame-aligned writes.
     * Only keeps most recent 200 reveals to prevent localStorage bloat.
     */
    const persistReveals = useCallback(() => {
      if (typeof window === "undefined") return
      if (persistTimeoutRef.current) {
        cancelAnimationFrame(persistTimeoutRef.current)
      }

      persistTimeoutRef.current = requestAnimationFrame(() => {
        try {
          const payload = JSON.stringify(revealsRef.current.slice(-200))
          window.localStorage.setItem(STORAGE_KEY, payload)
        } catch {
          // Silently fail on quota exceeded or privacy mode
        }
        persistTimeoutRef.current = null
      })
    }, [])
    // Memoized Mapbox map accessor
    const getMap = useCallback(() => mapRef.current?.getMap(), [mapRef])

    // === EFFECT: RESIZE OBSERVER ===
    /**
     * Watch container size changes and update canvas dimensions.
     * Needed for responsive behavior when window resizes or map container changes.
     */
    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      updateSize()
      const observer = new ResizeObserver(updateSize)
      observer.observe(container)

      return () => {
        observer.disconnect()
      }
    }, [updateSize])

    // === EFFECT: LOAD PERSISTED REVEALS ===
    /**
     * On mount, restore previously revealed areas from localStorage.
     * Uses defensive parsing to handle corrupted or old data gracefully.
     * Only runs once on mount (empty deps array).
     */
    useEffect(() => {
      if (typeof window === "undefined") return

      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (!stored) return
        const parsed: unknown = JSON.parse(stored)
        if (!Array.isArray(parsed)) return

        // Validate each stored point has correct structure
        const normalized: RevealPoint[] = []
        for (const item of parsed.slice(-200)) {
          if (typeof item !== "object" || item === null) {
            continue
          }

          const candidate = item as Record<string, unknown>
          const { lng, lat, radiusMeters } = candidate

          if (
            typeof lng === "number" &&
            typeof lat === "number" &&
            typeof radiusMeters === "number"
          ) {
            normalized.push({ lng, lat, radiusMeters })
          }
        }

        revealsRef.current = normalized
        lastRevealRef.current = normalized[normalized.length - 1] ?? null
      } catch {
        // Silently fall back to empty reveals on parse errors
      }
    }, [])

    // === EFFECT: MARKER POSITION REVEAL ===
    /**
     * Reveal areas as the purple marker (userPosition) moves.
     * Creates a trail of revealed areas along the marker's path.
     * Each time the marker moves to a new position, add a reveal point.
     */
    useEffect(() => {
      if (!userPosition) return
      const map = getMap()
      if (!map) return

      const last = lastMarkerPosRef.current

      // Check if marker has moved significantly (or is initial position)
      if (last) {
        const lastScreen = map.project([last.lng, last.lat])
        const currentScreen = map.project([userPosition.lng, userPosition.lat])
        const distance = Math.hypot(
          currentScreen.x - lastScreen.x,
          currentScreen.y - lastScreen.y,
        )

        // Only add reveal if moved more than 35% of reveal radius
        const threshold = revealSize * 0.35
        if (distance < threshold) {
          return
        }
      }

      // Use fixed radius in meters, independent of zoom level
      const newReveal: RevealPoint = {
        lng: userPosition.lng,
        lat: userPosition.lat,
        radiusMeters: FIXED_REVEAL_RADIUS_METERS,
      }

      // Add to reveals array and update tracking
      revealsRef.current = [...revealsRef.current, newReveal].slice(-200)
      lastRevealRef.current = newReveal
      lastMarkerPosRef.current = {
        lat: userPosition.lat,
        lng: userPosition.lng,
      }
      persistReveals()
    }, [userPosition, revealSize, getMap, persistReveals])

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
          initialRevealCreatedRef.current = false
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEY)
          }

          // Create initial reveal at user's current position after reset
          if (userPosition) {
            const newReveal: RevealPoint = {
              lng: userPosition.lng,
              lat: userPosition.lat,
              radiusMeters: FIXED_REVEAL_RADIUS_METERS,
            }
            revealsRef.current = [newReveal]
            lastRevealRef.current = newReveal
            lastMarkerPosRef.current = {
              lat: userPosition.lat,
              lng: userPosition.lng,
            }
          }
        },
      }),
      [userPosition],
    )

    // === EFFECT: MAP CHANGE TRACKING ===
    /**
     * Update canvas size when map resizes or moves.
     * Mapbox may resize its container during pan/zoom operations.
     */
    useEffect(() => {
      const map = mapRef.current?.getMap()
      if (!map) return

      map.on("resize", updateSize)

      return () => {
        map.off("resize", updateSize)
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
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, width, height)

        // STEP 1: Fill entire canvas with opaque fog
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, intensity)})`
        ctx.fillRect(0, 0, width, height)

        const applyReveal = () => {
          const map = getMap()
          if (!map) return

          // STEP 2: Draw marker hints through the fog
          // Ripple effect animation to guide users to sound locations
          ctx.globalCompositeOperation = "source-over"

          // Ripple animation parameters
          const time = performance.now()
          const rippleCycle = BASE_CYCLE_MS * RIPPLE_FREQUENCY_DIVISOR // 8 second cycle (1/4 frequency = 4x slower)
          const maxRippleRadius = 20 // Maximum ripple radius in pixels

          for (const sound of sounds) {
            // Skip filtered-out markers
            if (filters.length > 0 && !filters.includes(sound.category)) {
              continue
            }

            const screen = map.project([
              sound.coordinates.lng,
              sound.coordinates.lat,
            ])

            // Draw 2 ripples with offset phases for continuous effect
            for (let rippleIndex = 0; rippleIndex < 2; rippleIndex++) {
              const phaseOffset = rippleIndex * 0.5 // 50% phase offset
              const progress = (time / rippleCycle + phaseOffset) % 1.0 // 0 to 1

              // Radius grows from 0 to max
              const radius = progress * maxRippleRadius

              // Opacity fades out as ripple expands (starts at 0.5, ends at 0)
              const opacity = (1 - progress) * 0.5

              if (opacity > 0.05) {
                // Only draw if visible
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2)
                ctx.stroke()
              }
            }
          }

          // STEP 3: Punch holes in fog for persistent reveals
          ctx.globalCompositeOperation = "destination-out"

          // STEP 4: Draw all stored reveal circles (from past exploration)
          // Using geographic coordinates so they stay in place during pan/zoom
          const reveals = revealsRef.current
          if (reveals.length > 0) {
            // Pre-calculate zoom-dependent conversion factor (optimization)
            const currentZoom = map.getZoom()
            const zoomFactor = 2 ** currentZoom

            for (let i = 0; i < reveals.length; i++) {
              const reveal = reveals[i]
              // Project geographic coordinates to screen pixels
              const screen = map.project([reveal.lng, reveal.lat])

              // Calculate pixel radius from meters based on current zoom
              // Using pre-calculated zoom factor to avoid repeated exponentiation
              const metersPerPixel =
                (156543.03392 * Math.cos((reveal.lat * Math.PI) / 180)) /
                zoomFactor
              const radiusPixels = Math.max(
                20,
                reveal.radiusMeters / metersPerPixel,
              )

              drawRevealCircle(ctx, screen.x, screen.y, radiusPixels)
            }
          }

          // Reset composite mode (markers are rendered separately by SoundMarkersCanvas)
          ctx.globalCompositeOperation = "source-over"
        }

        applyReveal()

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(drawFrame)
      }

      drawFrame()

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }, [size, intensity, enabled, getMap, sounds, filters])

    // === EFFECT: CLEANUP ===
    /**
     * Cancel pending localStorage writes on unmount.
     * Prevents memory leaks from dangling requestAnimationFrame callbacks.
     */
    useEffect(
      () => () => {
        if (persistTimeoutRef.current) {
          cancelAnimationFrame(persistTimeoutRef.current)
        }
      },
      [],
    )

    if (!enabled) return null

    return (
      <div ref={containerRef} className={fogOverlayContainer}>
        <canvas ref={canvasRef} className={fogCanvas} />
      </div>
    )
  },
)

MapFogOverlay.displayName = "MapFogOverlay"

/**
 * Draw a single reveal circle with radial gradient falloff.
 *
 * Gradient Approach:
 * - Inner stop (0): Fully opaque black (full reveal)
 * - Middle stop (0.6): Still mostly opaque - creates steeper fog progression
 * - Outer stop (1): Fully transparent (sharp edge)
 * - Steeper gradient makes fog appear to "get thicker faster"
 *
 * Why black gradient:
 * - With "destination-out" mode, black pixels erase fog
 * - Gradient alpha creates smooth transparency transition
 * - Steeper falloff creates more dramatic fog boundary
 */
function drawRevealCircle(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
) {
  if (radius <= 0) return

  // Create radial gradient from center to edge
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0, // Inner radius (center point)
    centerX,
    centerY,
    radius, // Outer radius
  )
  gradient.addColorStop(0, "rgba(0,0,0,1)") // Fully opaque at center
  gradient.addColorStop(0.6, "rgba(0,0,0,0.9)") // Still mostly opaque at 60%
  gradient.addColorStop(1, "rgba(0,0,0,0)") // Fully transparent at edge

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()
}
