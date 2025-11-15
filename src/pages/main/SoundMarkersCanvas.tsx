import { Application, Graphics } from "pixi.js"
import { useEffect, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { brandColors } from "@/theme/colors"
import type { Category, Sound } from "../../domain/base"
import { canvasContainer, pixiCanvas } from "./SoundMarkersCanvas.css"
import { computeZoomProgress, computeZoomScale } from "./zoomScale"

interface Props {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly sounds: ReadonlyArray<Sound>
  readonly filters: readonly Category[]
  readonly onSoundClick: (sound: Sound) => void
}

interface SoundMarker {
  sound: Sound
  ripples: Ripple[]
  dot: Graphics
}

interface Ripple {
  graphics: Graphics
  age: number
  maxAge: number
}

const CATEGORY_COLORS = {
  Listen: brandColors.icons.listen,
  See: brandColors.icons.see,
  Feel: brandColors.icons.feel,
} as const

const CATEGORY_RADIUS_FACTOR: Record<Category, number> = {
  Listen: 1,
  See: 1.2,
  Feel: 1.4,
}

const BASE_SOUND_RADIUS = 8
const MIN_MARKER_RADIUS = 4
const MAX_MARKER_RADIUS = 16

const clampRadius = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max))

const RIPPLE_MIN_SCALE = 1
const RIPPLE_MAX_SCALE = 4
const RIPPLE_ANIMATION_RANGE_FACTOR = 3

/**
 * Sound markers rendered on a Pixi.js canvas overlay with ripple effects.
 */
export const SoundMarkersCanvas = ({
  mapRef,
  sounds,
  filters,
  onSoundClick,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const markersRef = useRef<SoundMarker[]>([])

  useEffect(() => {
    const map = mapRef.current?.getMap()
    const container = containerRef.current
    if (!map || !container) return

    let mounted = true
    let app: Application | null = null

    const initPixi = async () => {
      try {
        app = new Application()
        const mapContainer = map.getContainer()
        await app.init({
          backgroundAlpha: 0,
          antialias: true,
          resolution: 1,
          autoDensity: false,
          width: mapContainer.clientWidth,
          height: mapContainer.clientHeight,
        })

        if (!mounted || !app.canvas) {
          app.destroy(true, { children: true })
          return
        }

        appRef.current = app
        app.canvas.className = pixiCanvas
        container.appendChild(app.canvas)

        // Click handler
        app.canvas.addEventListener("click", (e) => {
          const currentMap = mapRef.current?.getMap()
          if (!currentMap || !app) return

          const rect = app.canvas.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          for (const marker of markersRef.current) {
            if (!filters.includes(marker.sound.category)) continue

            const point = currentMap.project([
              marker.sound.coordinates.lng,
              marker.sound.coordinates.lat,
            ])

            const distance = Math.hypot(x - point.x, y - point.y)

            if (distance <= 36) {
              onSoundClick(marker.sound)
              return
            }
          }
        })

        // Create markers for each sound
        const markers: SoundMarker[] = []
        for (let i = 0; i < sounds.length; i++) {
          const sound = sounds[i]
          const rippleCount = 2
          const rippleDelay = 1.0

          const ripples: Ripple[] = []
          for (let j = 0; j < rippleCount; j++) {
            const graphics = new Graphics()
            app.stage.addChild(graphics)
            ripples.push({
              graphics,
              age: j * rippleDelay + i * 0.3,
              maxAge: 3.0,
            })
          }

          const dot = new Graphics()
          app.stage.addChild(dot)

          markers.push({ sound, ripples, dot })
        }
        markersRef.current = markers

        // Animation loop
        app.ticker.add((ticker) => {
          const currentMap = mapRef.current?.getMap()
          if (!currentMap || !mounted || !app) return

          // Keep renderer in sync with map size
          const mapContainer = currentMap.getContainer()
          const cssWidth = mapContainer.clientWidth
          const cssHeight = mapContainer.clientHeight
          if (
            app.screen.width !== cssWidth ||
            app.screen.height !== cssHeight
          ) {
            app.renderer.resize(cssWidth, cssHeight)
          }

          const deltaTime = ticker.deltaTime / 60
          const currentZoom = currentMap.getZoom()
          const zoomProgress = computeZoomProgress(currentZoom)

          // Non-linear scale for dots/avatar
          const zoomScale = computeZoomScale(currentZoom)

          const rippleZoomScaleBase =
            RIPPLE_MIN_SCALE +
            zoomProgress * (RIPPLE_MAX_SCALE - RIPPLE_MIN_SCALE)

          for (const marker of markersRef.current) {
            if (!filters.includes(marker.sound.category)) {
              for (const ripple of marker.ripples) {
                ripple.graphics.clear()
              }
              marker.dot.clear()
              continue
            }

            const point = currentMap.project([
              marker.sound.coordinates.lng,
              marker.sound.coordinates.lat,
            ])
            const color = CATEGORY_COLORS[marker.sound.category]

            const categoryRadiusScale =
              CATEGORY_RADIUS_FACTOR[marker.sound.category] ?? 1
            const scaledRadius = clampRadius(
              BASE_SOUND_RADIUS * zoomScale * categoryRadiusScale,
              MIN_MARKER_RADIUS,
              MAX_MARKER_RADIUS,
            )

            const rippleMinRadius = scaledRadius * 2
            const rippleAnimationDelta =
              scaledRadius * RIPPLE_ANIMATION_RANGE_FACTOR

            // RIPPLE DRAWING (linear zoom effect)
            for (const ripple of marker.ripples) {
              ripple.graphics.clear()
              ripple.age += deltaTime

              if (ripple.age >= ripple.maxAge) {
                ripple.age = 0
              }

              const progress = ripple.age / ripple.maxAge

              const baseRippleRadius =
                rippleMinRadius + progress * rippleAnimationDelta
              const rippleZoomScale = rippleZoomScaleBase

              // Future: const reachFactor = marker.sound.reach ?? 1
              // const radius =
              //   baseRippleRadius * rippleZoomScaleBase * reachFactor
              const radius = baseRippleRadius * rippleZoomScale
              const alpha = Math.max(0, 1 - progress) * 0.6

              ripple.graphics.circle(point.x, point.y, radius)
              ripple.graphics.stroke({
                width: 2,
                color,
                alpha,
              })
            }

            // DOT DRAWING (non-linear zoom effect)
            marker.dot.clear()
            marker.dot.circle(point.x, point.y, scaledRadius)
            marker.dot.fill({ color, alpha: 0.9 })
          }
        })
      } catch (err) {
        console.error("Failed to initialize Pixi application:", err)
      }
    }

    initPixi()

    return () => {
      mounted = false

      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }

      markersRef.current = []
    }
  }, [mapRef, sounds, filters, onSoundClick])

  return <div ref={containerRef} className={canvasContainer} />
}
