import { Application, Graphics } from "pixi.js"
import { useEffect, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import type { Category, Sound } from "@/domain/sound"
import { mapColorTheme } from "@/theme/mapColors"
import { syncPixiRendererSize } from "../../lib/mapCanvas"
import type { PixiRipple } from "../../lib/ripple"
import {
  createPixiRipples,
  SOUND_MARKER_RIPPLE_CONFIG,
  updatePixiRipple,
} from "../../lib/ripple"
import { computeZoomScale, scaleAndClampRadius } from "../../lib/zoomScale"
import { canvasContainer, pixiCanvas } from "./SoundMarkersCanvas.css"

interface Props {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly sounds: ReadonlyArray<Sound>
  readonly filters: readonly Category[]
  readonly onSoundClick: (sound: Sound) => void
  readonly playingSound: Sound | null
}

type RGBColor = readonly [number, number, number]

interface SoundMarker {
  sound: Sound
  ripples: PixiRipple[]
  dot: Graphics
  screenPosition: { x: number; y: number }
  currentRadius: number
  currentColor: RGBColor
  glowAlpha: number
}

const CATEGORY_COLORS = mapColorTheme.soundBaseColors
const HOVER_COLORS = mapColorTheme.soundHoverColors
const GLOW_COLORS = mapColorTheme.soundGlowColors

const CATEGORY_RADIUS_FACTOR: Record<Category, number> = {
  Listen: 1,
  See: 1.2,
  Feel: 1.4,
}

const BASE_SOUND_RADIUS = 8
const MIN_MARKER_RADIUS = 4
const MAX_MARKER_RADIUS = 16
const MARKER_STROKE_WIDTH = 3
const SOUND_TRANSITION_DURATION_MS = mapColorTheme.hoverTransitionMs
const SOUND_GLOW_RADIUS = mapColorTheme.soundGlowRadius
const SOUND_GLOW_OPACITY = mapColorTheme.soundGlowOpacity
const RIPPLE_STROKE_WIDTH = mapColorTheme.peripheralRingStrokeWidth
const RIPPLE_ALPHA_SCALE = mapColorTheme.peripheralRingOpacityScale

const clampColorChannel = (value: number) =>
  Math.min(255, Math.max(0, Math.round(value)))

const hexColorToNumber = (hexColor: string): number =>
  Number.parseInt(hexColor.replace("#", ""), 16)

const hexToRgb = (hexColor: string): RGBColor => {
  const normalized = hexColor.replace("#", "")
  const channels = [0, 2, 4].map((offset) =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16),
  )

  return [
    clampColorChannel(channels[0]),
    clampColorChannel(channels[1]),
    clampColorChannel(channels[2]),
  ] as RGBColor
}

const rgbToNumber = ([r, g, b]: RGBColor): number =>
  (clampColorChannel(r) << 16) |
  (clampColorChannel(g) << 8) |
  clampColorChannel(b)

const lerpValue = (current: number, target: number, factor: number) =>
  current + (target - current) * factor

const lerpColor = (
  current: RGBColor,
  target: RGBColor,
  factor: number,
): RGBColor =>
  [
    clampColorChannel(lerpValue(current[0], target[0], factor)),
    clampColorChannel(lerpValue(current[1], target[1], factor)),
    clampColorChannel(lerpValue(current[2], target[2], factor)),
  ] as RGBColor

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
  const filtersRef = useRef<readonly Category[]>(filters)
  const onSoundClickRef = useRef(onSoundClick)

  useEffect(() => {
    playingSoundRef.current = playingSound
  }, [playingSound])

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    onSoundClickRef.current = onSoundClick
  }, [onSoundClick])

  useEffect(() => {
    const map = mapRef.current?.getMap()
    const container = containerRef.current
    if (!map || !container) return

    let mounted = true
    let app: Application | null = null
    const mapCanvas = map.getCanvas()
    const previousCursor = mapCanvas.style.cursor

    const handlePointerMove = (event: PointerEvent) => {
      const currentMap = mapRef.current?.getMap()
      if (!currentMap) {
        hoveredSoundRef.current = null
        return
      }

      const rect = mapCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      let nearest: Sound | null = null
      for (const marker of markersRef.current) {
        if (!filtersRef.current.includes(marker.sound.category)) continue
        const { x: markerX, y: markerY } = marker.screenPosition
        const radius = Math.max(marker.currentRadius, MIN_MARKER_RADIUS)
        const distance = Math.hypot(x - markerX, y - markerY)
        if (distance <= radius) {
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
      const currentMap = mapRef.current?.getMap()
      if (!currentMap) return

      const rect = mapCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      for (const marker of markersRef.current) {
        if (!filtersRef.current.includes(marker.sound.category)) continue

        const { x: markerX, y: markerY } = marker.screenPosition
        const radius = Math.max(marker.currentRadius, MIN_MARKER_RADIUS)
        const distance = Math.hypot(x - markerX, y - markerY)

        if (distance <= radius) {
          onSoundClickRef.current(marker.sound)
          return
        }
      }
    }

    const handleMapDragStart = () => {
      mapCanvas.style.cursor = "grabbing"
    }

    const handleMapDragEnd = () => {
      mapCanvas.style.cursor = "pointer"
    }

    mapCanvas.style.cursor = "pointer"
    mapCanvas.addEventListener("click", handleClick)
    mapCanvas.addEventListener("pointermove", handlePointerMove)
    mapCanvas.addEventListener("pointerleave", handlePointerLeave)
    map.on("dragstart", handleMapDragStart)
    map.on("dragend", handleMapDragEnd)

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

          markers.push({
            sound,
            ripples,
            dot,
            screenPosition: { x: 0, y: 0 },
            currentRadius: BASE_SOUND_RADIUS,
            currentColor: hexToRgb(CATEGORY_COLORS[sound.category]),
            glowAlpha: 0,
          })
        }
        markersRef.current = markers

        // Animation loop
        app.ticker.add((ticker) => {
          const currentMap = mapRef.current?.getMap()
          if (!currentMap || !mounted || !app) return

          // Keep renderer in sync with map size
          syncPixiRendererSize(app, currentMap)

          const deltaTime = ticker.deltaTime / 60
          const deltaMs = ticker.deltaMS ?? deltaTime * 1000
          const currentZoom = currentMap.getZoom()

          // Non-linear scale for dots
          const zoomScale = computeZoomScale(currentZoom)
          const smoothingFactor = Math.min(
            1,
            deltaMs / SOUND_TRANSITION_DURATION_MS,
          )
          for (const marker of markersRef.current) {
            if (!filtersRef.current.includes(marker.sound.category)) {
              for (const ripple of marker.ripples) {
                ripple.graphics.clear()
              }
              marker.dot.clear()
              continue
            }

            const point = currentMap.project(marker.sound.coordinate)
            marker.screenPosition = point

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

            const targetRadius = scaleAndClampRadius(
              BASE_SOUND_RADIUS,
              zoomScale,
              categoryRadiusScale * hoverScale * playingScale,
              MIN_MARKER_RADIUS,
              MAX_MARKER_RADIUS,
            )

            marker.currentRadius = lerpValue(
              marker.currentRadius,
              targetRadius,
              smoothingFactor,
            )

            const targetColor = hexToRgb(
              isHovered
                ? HOVER_COLORS[marker.sound.category]
                : CATEGORY_COLORS[marker.sound.category],
            )
            marker.currentColor = lerpColor(
              marker.currentColor,
              targetColor,
              smoothingFactor,
            )
            const strokeColorValue = rgbToNumber(marker.currentColor)
            const strokeAlpha = isHovered ? 1 : 0.85
            const targetGlowAlpha = isHovered ? SOUND_GLOW_OPACITY : 0
            marker.glowAlpha = lerpValue(
              marker.glowAlpha,
              targetGlowAlpha,
              smoothingFactor,
            )

            // RIPPLE DRAWING
            const rippleBaseRadius = scaleAndClampRadius(
              BASE_SOUND_RADIUS,
              zoomScale,
              categoryRadiusScale,
              MIN_MARKER_RADIUS,
              MAX_MARKER_RADIUS,
            )
            const rippleConfig = {
              ...SOUND_MARKER_RIPPLE_CONFIG,
              baseRadius: rippleBaseRadius * 2,
              alphaScale: RIPPLE_ALPHA_SCALE,
              strokeWidth: RIPPLE_STROKE_WIDTH,
            }
            const rippleColorValue = hexColorToNumber(
              mapColorTheme.peripheralRingColor,
            )

            for (const ripple of marker.ripples) {
              updatePixiRipple(
                ripple,
                deltaTime,
                point.x,
                point.y,
                currentZoom,
                rippleConfig,
                rippleColorValue,
              )
            }

            // DOT DRAWING (non-linear zoom effect)
            marker.dot.clear()
            if (marker.glowAlpha > 0.01) {
              marker.dot.circle(
                point.x,
                point.y,
                marker.currentRadius + SOUND_GLOW_RADIUS,
              )
              marker.dot.fill({
                color: hexColorToNumber(GLOW_COLORS[marker.sound.category]),
                alpha: marker.glowAlpha,
              })
            }
            marker.dot.circle(point.x, point.y, marker.currentRadius)
            marker.dot.stroke({
              width: MARKER_STROKE_WIDTH,
              color: strokeColorValue,
              alpha: strokeAlpha,
            })
            marker.dot.fill({ color: 0x000000, alpha: 0 })
          }
        })
      } catch (err) {
        console.error("Failed to initialize Pixi application:", err)
      }
    }

    initPixi()

    return () => {
      mounted = false

      mapCanvas.removeEventListener("click", handleClick)
      mapCanvas.removeEventListener("pointermove", handlePointerMove)
      mapCanvas.removeEventListener("pointerleave", handlePointerLeave)
      map.off("dragstart", handleMapDragStart)
      map.off("dragend", handleMapDragEnd)
      mapCanvas.style.cursor = previousCursor

      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }

      markersRef.current = []
    }
  }, [mapRef, sounds])

  return (
    <div
      ref={containerRef}
      className={canvasContainer}
      data-testid="sound-markers-layer"
    />
  )
}
