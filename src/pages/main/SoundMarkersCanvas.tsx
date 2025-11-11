import { Application, Graphics } from "pixi.js"
import { useEffect, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { brandColors } from "@/theme/colors"
import type { Category, Sound } from "../../domain/base"

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

const BASE_SOUND_RADIUS = 8

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
        // Create Pixi application
        app = new Application()
        await app.init({
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          width: map.getCanvas().width,
          height: map.getCanvas().height,
        })

        if (!mounted || !app.canvas) {
          app.destroy(true, { children: true })
          return
        }

        appRef.current = app

        // Style canvas to overlay the map
        app.canvas.style.position = "absolute"
        app.canvas.style.top = "0"
        app.canvas.style.left = "0"
        app.canvas.style.cursor = "pointer"
        app.canvas.style.zIndex = "1"

        container.appendChild(app.canvas)

        // Add click handler for markers
        app.canvas.addEventListener("click", (e) => {
          if (!map || !app) return

          const rect = app.canvas.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          // Check each marker for hit detection
          for (const marker of markers) {
            if (!filters.includes(marker.sound.category)) continue

            const point = map.project([
              marker.sound.coordinates.lng,
              marker.sound.coordinates.lat,
            ])

            const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)

            // Check if click is within marker radius (including ripples)
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
              age: j * rippleDelay + i * 0.3, // Stagger start times
              maxAge: 3.0,
            })
          }

          // Create center dot
          const dot = new Graphics()
          app.stage.addChild(dot)

          markers.push({
            sound,
            ripples,
            dot,
          })
        }
        markersRef.current = markers

        // Animation loop
        app.ticker.add((ticker) => {
          if (!map || !mounted || !app) return

          // Update canvas size if map resized
          const mapCanvas = map.getCanvas()
          if (
            app.canvas.width !== mapCanvas.width ||
            app.canvas.height !== mapCanvas.height
          ) {
            app.renderer.resize(mapCanvas.width, mapCanvas.height)
          }

          // Update each marker
          const deltaTime = ticker.deltaTime / 60

          for (const marker of markers) {
            // Skip if filtered out
            if (!filters.includes(marker.sound.category)) {
              // Clear graphics
              for (const ripple of marker.ripples) {
                ripple.graphics.clear()
              }
              marker.dot.clear()
              continue
            }

            // Get pixel coordinates
            const point = map.project([
              marker.sound.coordinates.lng,
              marker.sound.coordinates.lat,
            ])

            const color = CATEGORY_COLORS[marker.sound.category]

            // Clear and update ripples
            for (const ripple of marker.ripples) {
              ripple.graphics.clear()
              ripple.age += deltaTime

              if (ripple.age >= ripple.maxAge) {
                ripple.age = 0
              }

              const progress = ripple.age / ripple.maxAge
              const radius = 12 + progress * 18
              const alpha = Math.max(0, 1 - progress) * 0.6

              ripple.graphics.circle(point.x, point.y, radius)
              ripple.graphics.stroke({
                width: 2,
                color,
                alpha,
              })
            }

            // Draw center dot
            marker.dot.clear()
            marker.dot.circle(point.x, point.y, BASE_SOUND_RADIUS)
            marker.dot.fill({ color, alpha: 0.9 })
          }
        })
      } catch (err) {
        console.error("Failed to initialize Pixi application:", err)
      }
    }

    initPixi()

    // Cleanup
    return () => {
      mounted = false

      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }

      markersRef.current = []
    }
  }, [mapRef, sounds, filters, onSoundClick])

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  )
}
