import { Application, Graphics } from "pixi.js"
import { useEffect, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { brandColors } from "@/theme/colors"
import type { Category, Sound } from "../../domain/base"
import { projectToScreen, syncPixiRendererSize } from "./mapCanvas"
import type { PixiRipple } from "./ripple"
import {
  createPixiRipples,
  SOUND_MARKER_RIPPLE_CONFIG,
  updatePixiRipple,
} from "./ripple"
import { canvasContainer, pixiCanvas } from "./SoundMarkersCanvas.css"
import { computeZoomScale, scaleAndClampRadius } from "./zoomScale"

interface Props {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly sounds: ReadonlyArray<Sound>
  readonly filters: readonly Category[]
  readonly onSoundClick: (sound: Sound) => void
  readonly playingSound: Sound | null
}

interface SoundMarker {
  sound: Sound
  ripples: PixiRipple[]
  dot: Graphics
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

/**
 * Sound markers rendered on a Pixi.js canvas overlay with ripple effects.
 */
export const SoundMarkersCanvas = ({
  mapRef,
  sounds,
  filters,
  onSoundClick,
  playingSound,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const markersRef = useRef<SoundMarker[]>([])
  const hoveredSoundRef = useRef<Sound | null>(null)
  const playingSoundRef = useRef<Sound | null>(playingSound)

  useEffect(() => {
    playingSoundRef.current = playingSound
  }, [playingSound])

  useEffect(() => {
    const map = mapRef.current?.getMap()
    const container = containerRef.current
    if (!map || !container) return

    let mounted = true
    let app: Application | null = null

    const handlePointerMove = (event: PointerEvent) => {
      const appInstance = appRef.current
      const currentMap = mapRef.current?.getMap()
      if (!currentMap || !appInstance?.canvas) {
        hoveredSoundRef.current = null
        return
      }

      const rect = appInstance.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      let nearest: Sound | null = null
      for (const marker of markersRef.current) {
        if (!filters.includes(marker.sound.category)) continue
        const point = projectToScreen(
          currentMap,
          marker.sound.coordinates.lng,
          marker.sound.coordinates.lat,
        )
        const distance = Math.hypot(x - point.x, y - point.y)
        if (distance <= 36) {
          nearest = marker.sound
          break
        }
      }
      hoveredSoundRef.current = nearest
    }

    const handlePointerLeave = () => {
      hoveredSoundRef.current = null
    }

    const handleClick = (event: MouseEvent) => {
      const appInstance = appRef.current
      const currentMap = mapRef.current?.getMap()
      if (!currentMap || !appInstance?.canvas) return

      const rect = appInstance.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      for (const marker of markersRef.current) {
        if (!filters.includes(marker.sound.category)) continue

        const point = projectToScreen(
          currentMap,
          marker.sound.coordinates.lng,
          marker.sound.coordinates.lat,
        )

        const distance = Math.hypot(x - point.x, y - point.y)

        if (distance <= 36) {
          onSoundClick(marker.sound)
          return
        }
      }
    }

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
        app.canvas.addEventListener("click", handleClick)
        app.canvas.addEventListener("pointermove", handlePointerMove)
        app.canvas.addEventListener("pointerleave", handlePointerLeave)

        // Create markers for each sound
        const markers: SoundMarker[] = []
        for (let i = 0; i < sounds.length; i++) {
          const sound = sounds[i]
          const ripples = createPixiRipples(SOUND_MARKER_RIPPLE_CONFIG, i * 0.3)

          // Add ripple graphics to stage
          for (const ripple of ripples) {
            app.stage.addChild(ripple.graphics)
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
          syncPixiRendererSize(app, currentMap)

          const deltaTime = ticker.deltaTime / 60
          const currentZoom = currentMap.getZoom()

          // Non-linear scale for dots
          const zoomScale = computeZoomScale(currentZoom)

          for (const marker of markersRef.current) {
            if (!filters.includes(marker.sound.category)) {
              for (const ripple of marker.ripples) {
                ripple.graphics.clear()
              }
              marker.dot.clear()
              continue
            }

            const point = projectToScreen(
              currentMap,
              marker.sound.coordinates.lng,
              marker.sound.coordinates.lat,
            )
            const color = CATEGORY_COLORS[marker.sound.category]

            const categoryRadiusScale =
              CATEGORY_RADIUS_FACTOR[marker.sound.category] ?? 1
            const isHovered =
              hoveredSoundRef.current?.title === marker.sound.title
            const isPlaying =
              playingSoundRef.current?.title === marker.sound.title
            const hoverScale = isHovered ? 1.25 : 1
            const playingScale = isPlaying
              ? 1 + Math.sin(performance.now() / 300) * 0.15
              : 1

            const scaledRadius = scaleAndClampRadius(
              BASE_SOUND_RADIUS,
              zoomScale,
              categoryRadiusScale * hoverScale * playingScale,
              MIN_MARKER_RADIUS,
              MAX_MARKER_RADIUS,
            )

            // RIPPLE DRAWING
            const rippleConfig = {
              ...SOUND_MARKER_RIPPLE_CONFIG,
              baseRadius: scaledRadius * 2,
            }

            for (const ripple of marker.ripples) {
              updatePixiRipple(
                ripple,
                deltaTime,
                point.x,
                point.y,
                currentZoom,
                rippleConfig,
                color,
              )
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
        appRef.current.canvas?.removeEventListener("click", handleClick)
        appRef.current.canvas?.removeEventListener(
          "pointermove",
          handlePointerMove,
        )
        appRef.current.canvas?.removeEventListener(
          "pointerleave",
          handlePointerLeave,
        )
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }

      markersRef.current = []
    }
  }, [mapRef, sounds, filters, onSoundClick])

  return <div ref={containerRef} className={canvasContainer} />
}
