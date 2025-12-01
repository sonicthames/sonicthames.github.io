import type mapboxgl from "mapbox-gl"
import type { Application, Ticker } from "pixi.js"
import { Container, Graphics } from "pixi.js"
import { useCallback, useEffect, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import type { Category, Sound } from "@/domain/sound"
import { mapColorTheme } from "@/theme/mapColors"
import { interpolateColorNumber, smoothValue } from "../../lib/animation"
import { syncPixiRendererSize } from "../../lib/mapCanvas"
import { createPixiOverlay } from "../../lib/pixiOverlay"
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
  readonly mapReady: boolean
}

interface SoundMarker {
  sound: Sound
  ripples: PixiRipple[]
  dot: Graphics
  currentRadius: number
  currentColor: string
  glowAlpha: number
}

type OverlayState = {
  readonly app: Application
  readonly layer: Container
  readonly cleanupEvents: () => void
}

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

const createSoundMarker = (
  layer: Container,
  sound: Sound,
  offset: number,
): SoundMarker => {
  const ripples = createPixiRipples(SOUND_MARKER_RIPPLE_CONFIG, offset)

  for (const ripple of ripples) {
    layer.addChild(ripple.graphics)
  }

  const dot = new Graphics()
  layer.addChild(dot)

  return {
    sound,
    ripples,
    dot,
    currentRadius: BASE_SOUND_RADIUS,
    currentColor: mapColorTheme.soundBaseColors[sound.category],
    glowAlpha: 0,
  }
}

const disposeSoundMarker = (marker: SoundMarker) => {
  for (const ripple of marker.ripples) {
    ripple.graphics.parent?.removeChild(ripple.graphics)
    ripple.graphics.destroy()
  }
  marker.dot.parent?.removeChild(marker.dot)
  marker.dot.destroy()
}

export const SoundMarkersCanvas = ({
  mapRef,
  sounds,
  filters,
  onSoundClick,
  playingSound,
  mapReady,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<SoundMarker[]>([])
  const hoveredSoundRef = useRef<Sound | null>(null)
  const onSoundClickRef = useRef(onSoundClick)
  const filtersRef = useRef(filters)
  const playingSoundRef = useRef<Sound | null>(playingSound)
  const soundsRef = useRef(sounds)
  const soundRevisionRef = useRef(0)
  const lastRenderedSoundRevisionRef = useRef(-1)
  onSoundClickRef.current = onSoundClick
  filtersRef.current = filters
  playingSoundRef.current = playingSound
  const prevSounds = soundsRef.current
  if (prevSounds !== sounds) {
    soundRevisionRef.current += 1
  }
  soundsRef.current = sounds

  const disposeMarkers = useCallback((layer?: Container) => {
    for (const marker of markersRef.current) {
      disposeSoundMarker(marker)
    }
    markersRef.current = []
    layer?.removeChildren()
  }, [])

  const reconcileMarkers = useCallback(
    (layer: Container, targetSounds: ReadonlyArray<Sound>) => {
      const existing = markersRef.current
      const availableMarkers = new Map(
        existing.map((marker) => [marker.sound.marker, marker] as const),
      )
      const nextMarkers: SoundMarker[] = []

      for (let index = 0; index < targetSounds.length; index++) {
        const sound = targetSounds[index]
        const markerKey = sound.marker
        const reusedMarker = availableMarkers.get(markerKey)

        if (reusedMarker) {
          reusedMarker.sound = sound
          nextMarkers.push(reusedMarker)
          availableMarkers.delete(markerKey)
          continue
        }

        nextMarkers.push(createSoundMarker(layer, sound, index * 0.3))
      }

      for (const leftover of Array.from(availableMarkers.values())) {
        disposeSoundMarker(leftover)
      }

      markersRef.current = nextMarkers
    },
    [],
  )

  const init = useCallback(
    async (app: Application, mapInstance: mapboxgl.Map) => {
      const container = containerRef.current
      if (!container) {
        throw new Error("Sound markers container is missing")
      }

      const mapCanvas = mapInstance.getCanvas()
      const previousCursor = mapCanvas.style.cursor

      const updateHover = (event: PointerEvent) => {
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
          if (!filtersRef.current.includes(marker.sound.category)) {
            continue
          }

          // TODO use a hashmap for projected sound marker coordinates (to not project unnecessarily)
          const projected = currentMap.project(marker.sound.coordinate)
          const radius = Math.max(marker.currentRadius, MIN_MARKER_RADIUS)
          const distance = Math.hypot(x - projected.x, y - projected.y)
          if (distance <= radius) {
            nearest = marker.sound
            break
          }
        }

        hoveredSoundRef.current = nearest
      }

      const clearHover = () => {
        hoveredSoundRef.current = null
      }

      const handleClick = (event: MouseEvent) => {
        const currentMap = mapRef.current?.getMap()
        if (!currentMap) return

        const rect = mapCanvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        for (const marker of markersRef.current) {
          if (!filtersRef.current.includes(marker.sound.category)) {
            continue
          }

          const projected = currentMap.project(marker.sound.coordinate)
          const radius = Math.max(marker.currentRadius, MIN_MARKER_RADIUS)
          const distance = Math.hypot(x - projected.x, y - projected.y)

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
      mapCanvas.addEventListener("pointermove", updateHover)
      mapCanvas.addEventListener("pointerleave", clearHover)
      mapInstance.on("dragstart", handleMapDragStart)
      mapInstance.on("dragend", handleMapDragEnd)

      const mapContainer = mapInstance.getContainer()
      await app.init({
        backgroundAlpha: 0,
        antialias: true,
        resolution: 1,
        autoDensity: false,
        width: mapContainer.clientWidth,
        height: mapContainer.clientHeight,
      })

      if (!app.canvas) {
        throw new Error("Pixi application failed to initialize canvas.")
      }

      app.canvas.className = pixiCanvas
      container.appendChild(app.canvas)

      const layer = new Container()
      app.stage.addChild(layer)

      lastRenderedSoundRevisionRef.current = -1
      soundRevisionRef.current += 1

      return {
        app,
        layer,
        cleanupEvents: () => {
          mapCanvas.removeEventListener("click", handleClick)
          mapCanvas.removeEventListener("pointermove", updateHover)
          mapCanvas.removeEventListener("pointerleave", clearHover)
          mapInstance.off("dragstart", handleMapDragStart)
          mapInstance.off("dragend", handleMapDragEnd)
          mapCanvas.style.cursor = previousCursor
          hoveredSoundRef.current = null
        },
      }
    },
    [mapRef],
  )

  const onTick = useCallback(
    (state: OverlayState, mapInstance: mapboxgl.Map, ticker: Ticker) => {
      const { app, layer } = state
      const currentMap = mapRef.current?.getMap() ?? mapInstance

      syncPixiRendererSize(app, currentMap)

      if (soundRevisionRef.current !== lastRenderedSoundRevisionRef.current) {
        reconcileMarkers(layer, soundsRef.current)
        lastRenderedSoundRevisionRef.current = soundRevisionRef.current
      }

      const deltaTime = ticker.deltaTime / 60
      const deltaMs = ticker.deltaMS ?? deltaTime * 1000
      const currentZoom = currentMap.getZoom()
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

        const categoryRadiusScale =
          CATEGORY_RADIUS_FACTOR[marker.sound.category] ?? 1
        const isHovered = hoveredSoundRef.current?.title === marker.sound.title
        const isPlaying = playingSoundRef.current?.title === marker.sound.title
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

        marker.currentRadius = smoothValue(
          marker.currentRadius,
          targetRadius,
          deltaMs,
          SOUND_TRANSITION_DURATION_MS,
        )

        const targetColor = (
          isHovered
            ? mapColorTheme.soundHoverColors
            : mapColorTheme.soundBaseColors
        )[marker.sound.category]
        marker.currentColor = interpolateColorNumber(
          marker.currentColor,
          targetColor,
          smoothingFactor,
        )
        const strokeColorValue = marker.currentColor
        const strokeAlpha = isHovered ? 1 : 0.85
        const targetGlowAlpha = isHovered ? SOUND_GLOW_OPACITY : 0
        marker.glowAlpha = smoothValue(
          marker.glowAlpha,
          targetGlowAlpha,
          deltaMs,
          SOUND_TRANSITION_DURATION_MS,
        )

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

        for (const ripple of marker.ripples) {
          updatePixiRipple(
            ripple,
            deltaTime,
            point.x,
            point.y,
            currentZoom,
            rippleConfig,
            mapColorTheme.peripheralRingColor,
          )
        }

        marker.dot.clear()
        if (marker.glowAlpha > 0.01) {
          marker.dot.circle(
            point.x,
            point.y,
            marker.currentRadius + SOUND_GLOW_RADIUS,
          )
          marker.dot.fill({
            color: mapColorTheme.soundGlowColors[marker.sound.category],
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

      app.render()
    },
    [mapRef, reconcileMarkers],
  )

  const onDestroy = useCallback(
    ({ cleanupEvents, layer }: OverlayState) => {
      cleanupEvents()
      disposeMarkers(layer)
      layer.destroy({ children: true })
    },
    [disposeMarkers],
  )

  useEffect(() => {
    if (!mapReady) {
      return
    }

    const container = containerRef.current
    const mapInstance = mapRef.current?.getMap()
    if (!container || !mapInstance) {
      return
    }

    let cancelled = false
    let cleanupOverlay: (() => void) | null = null

    const attach = async () => {
      try {
        if (cancelled) return
        cleanupOverlay = await createPixiOverlay({
          container,
          init: (app) => init(app, mapInstance),
          onTick: (state, ticker) => onTick(state, mapInstance, ticker),
          onDestroy,
        })
      } catch (error) {
        console.error("Failed to initialize Pixi overlay:", error)
      }
    }

    void attach()

    return () => {
      cancelled = true
      cleanupOverlay?.()
      cleanupOverlay = null
    }
  }, [mapReady, mapRef, init, onTick, onDestroy])

  return (
    <div
      ref={containerRef}
      className={canvasContainer}
      data-testid="sound-markers-layer"
    />
  )
}
