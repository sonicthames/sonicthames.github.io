import type { LngLat, LngLatLike, Map as MapboxMapInstance } from "mapbox-gl"
import type { Application, Ticker } from "pixi.js"
import { Container, Graphics } from "pixi.js"
import { useCallback, useEffect, useLayoutEffect, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { mapColorTheme } from "@/theme/mapColors"
import { syncPixiRendererSize } from "../../lib/mapCanvas"
import { createPixiOverlay, overlayInitOptions } from "../../lib/pixiOverlay"
import { computeZoomScale, scaleAndClampRadius } from "../../lib/zoomScale"
import { canvasContainer, pixiCanvas } from "./UserPositionCanvas.css"

const AFTERIMAGE_FADE_DURATION_MS = 500
const AFTERIMAGE_INTERVAL_MS = 500
const AFTERIMAGE_LIFETIME_MS = 1500
const BASE_USER_RADIUS = 8
const MAX_AFTERIMAGES = 4
const MAX_USER_RADIUS = 16
const MIN_USER_RADIUS = 4
const MOVEMENT_EPSILON = 1e-5

const detectMovement = (
  current: LngLat,
  previous: { readonly lat: number; readonly lng: number },
): boolean =>
  Math.abs(current.lat - previous.lat) > MOVEMENT_EPSILON ||
  Math.abs(current.lng - previous.lng) > MOVEMENT_EPSILON

const computeFadeAlpha = (
  now: number,
  createdAt: number,
  maxAlpha: number,
): number => {
  const elapsed = now - createdAt
  const fadeWindow = Math.min(
    AFTERIMAGE_FADE_DURATION_MS,
    AFTERIMAGE_LIFETIME_MS,
  )
  const fadeStart = AFTERIMAGE_LIFETIME_MS - fadeWindow
  if (fadeWindow <= 0 || elapsed < fadeStart) {
    return maxAlpha
  }
  const fadeProgress = Math.min(1, (elapsed - fadeStart) / fadeWindow)
  return Math.max(0, maxAlpha * (1 - fadeProgress))
}

const spawnAfterimage = (
  ghostContainer: Container | null,
  afterimages: Map<Graphics, AfterimageMeta>,
  coordinate: LngLat,
  timestamp: number,
): void => {
  if (!ghostContainer) return
  const ghost = new Graphics()
  ghost.circle(0, 0, 1)
  ghost.fill({ color: mapColorTheme.userAvatarColor })
  ghost.alpha = 0
  ghostContainer.addChild(ghost)

  afterimages.set(ghost, {
    coordinate,
    createdAt: timestamp,
    expiresAt: timestamp + AFTERIMAGE_LIFETIME_MS,
  })

  if (afterimages.size > MAX_AFTERIMAGES) {
    const iterator = afterimages.keys()
    const oldestGhost = iterator.next().value
    if (oldestGhost) {
      oldestGhost.parent?.removeChild(oldestGhost)
      if (!oldestGhost.destroyed) {
        oldestGhost.destroy()
      }
      afterimages.delete(oldestGhost)
    }
  }
}

const updateGhostFadeoutPositions = (
  afterimages: Map<Graphics, AfterimageMeta>,
  map: MapboxMapInstance,
  scaledRadius: number,
  now: number,
): void => {
  const ghosts = Array.from(afterimages.entries())
  for (const [sprite, meta] of ghosts) {
    if (now >= meta.expiresAt) {
      sprite.parent?.removeChild(sprite)
      if (!sprite.destroyed) {
        sprite.destroy()
      }
      afterimages.delete(sprite)
      continue
    }
    const ghostPoint = map.project(meta.coordinate)
    sprite.position.set(ghostPoint.x, ghostPoint.y)
    sprite.scale.set(scaledRadius)
    sprite.alpha = computeFadeAlpha(now, meta.createdAt, 0.5)
  }
}

type AfterimageMeta = {
  readonly coordinate: LngLatLike
  readonly createdAt: number
  readonly expiresAt: number
}

interface Props {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly positionRef: React.RefObject<LngLat>
  readonly mapReady: boolean
}

type OverlayState = {
  readonly app: Application
  readonly ghostContainer: Container
  readonly avatar: Graphics
}

type OnTickHandler = (
  state: OverlayState,
  mapInstance: MapboxMapInstance,
  ticker: Ticker,
) => void

/**
 * User position indicator rendered on a Pixi.js canvas overlay with discrete
 * afterimages that appear while the avatar moves.
 */
export const UserPositionCanvas = ({
  mapRef,
  positionRef,
  mapReady,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const prevPositionRef = useRef<{ lat: number; lng: number } | null>(null)
  const afterimagesRef = useRef<Map<Graphics, AfterimageMeta>>(new Map())
  const ghostSpawnTimerRef = useRef(0)
  const isMovingRef = useRef<boolean>(false)
  const avatarRef = useRef<Graphics | null>(null)
  const ghostContainerRef = useRef<Container | null>(null)

  const clearGhosts = useCallback(() => {
    afterimagesRef.current.forEach((_meta, sprite) => {
      sprite.parent?.removeChild(sprite)
      if (!sprite.destroyed) {
        sprite.destroy()
      }
    })
    afterimagesRef.current.clear()
    ghostContainerRef.current?.removeChildren()
  }, [])

  const init = useCallback(
    async (app: Application, mapInstance: MapboxMapInstance) => {
      const container = containerRef.current
      if (!container) {
        throw new Error("User position container is missing")
      }

      await app.init(overlayInitOptions(mapInstance.getContainer()))

      if (!app.canvas) {
        throw new Error("Pixi application failed to initialize canvas.")
      }

      app.canvas.className = pixiCanvas
      container.appendChild(app.canvas)

      const ghostContainer = new Container()
      const avatar = new Graphics()
      ghostContainerRef.current = ghostContainer
      avatarRef.current = avatar
      app.stage.addChild(ghostContainer)
      app.stage.addChild(avatar)

      return { app, ghostContainer, avatar }
    },
    [],
  )

  const onTickRef = useRef<OnTickHandler>(() => undefined)
  const tickHandler: OnTickHandler = (state, mapInstance, ticker) => {
    const currentMap = mapRef.current?.getMap() ?? mapInstance
    syncPixiRendererSize(state.app, currentMap)

    const screenPoint = currentMap.project(positionRef.current)
    const zoomScale = computeZoomScale(currentMap.getZoom())
    const scaledRadius = scaleAndClampRadius(
      BASE_USER_RADIUS,
      zoomScale,
      1,
      MIN_USER_RADIUS,
      MAX_USER_RADIUS,
    )
    const deltaMs = ticker.deltaMS
    const now = performance.now()

    const avatarGraphic = avatarRef.current
    if (!avatarGraphic) return
    avatarGraphic.clear()
    avatarGraphic.circle(0, 0, scaledRadius)
    avatarGraphic.fill({ color: mapColorTheme.userAvatarColor })
    avatarGraphic.position.set(screenPoint.x, screenPoint.y)
    avatarGraphic.alpha = 1

    const prevPosition = prevPositionRef.current ?? positionRef.current
    const moved = detectMovement(positionRef.current, prevPosition)
    prevPositionRef.current = positionRef.current

    if (moved) {
      ghostSpawnTimerRef.current += deltaMs
      if (!isMovingRef.current) {
        isMovingRef.current = true
        spawnAfterimage(
          ghostContainerRef.current,
          afterimagesRef.current,
          positionRef.current,
          now,
        )
      }
      while (ghostSpawnTimerRef.current >= AFTERIMAGE_INTERVAL_MS) {
        ghostSpawnTimerRef.current -= AFTERIMAGE_INTERVAL_MS
        spawnAfterimage(
          ghostContainerRef.current,
          afterimagesRef.current,
          positionRef.current,
          now,
        )
      }
    } else {
      ghostSpawnTimerRef.current = 0
      isMovingRef.current = false
    }

    updateGhostFadeoutPositions(
      afterimagesRef.current,
      currentMap,
      scaledRadius,
      now,
    )

    state.app.render()
  }
  useLayoutEffect(() => {
    onTickRef.current = tickHandler
  })

  const onTick = useCallback(
    (state: OverlayState, mapInstance: MapboxMapInstance, ticker: Ticker) => {
      onTickRef.current(state, mapInstance, ticker)
    },
    [],
  )

  const onDestroy = useCallback(
    ({ ghostContainer }: OverlayState) => {
      clearGhosts()
      isMovingRef.current = false
      ghostSpawnTimerRef.current = 0
      avatarRef.current = null
      ghostContainerRef.current = null
      ghostContainer.destroy({ children: true })
    },
    [clearGhosts],
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

  return <div ref={containerRef} className={canvasContainer} />
}

UserPositionCanvas.displayName = "UserPositionCanvas"
