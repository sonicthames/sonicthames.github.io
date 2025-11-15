import type { Map as MapboxMapInstance } from "mapbox-gl"
import { Application, Container, Graphics } from "pixi.js"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { canvasContainer, pixiCanvas } from "./UserPositionCanvas.css"
import { computeZoomScale } from "./zoomScale"

interface Props {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly positionRef: React.MutableRefObject<{ lat: number; lng: number }>
}

const BASE_USER_RADIUS = 8
const MIN_USER_RADIUS = 4
const MAX_USER_RADIUS = 16
const MOVEMENT_EPSILON = 1e-5
const AFTERIMAGE_INTERVAL_MS = 800
const AFTERIMAGE_LIFETIME_MS = 1100
const MAX_AFTERIMAGES = 6
const AVATAR_FADE_DURATION_MS = 150

const clampRadius = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max))

type Afterimage = {
  sprite: Graphics
  lat: number
  lng: number
  createdAt: number
  expiresAt: number
}

export interface UserPositionHandle {
  readonly fadeIn: () => void
}

/**
 * User position indicator rendered on a Pixi.js canvas overlay with discrete
 * afterimages that appear while the avatar moves.
 */
export const UserPositionCanvas = forwardRef<UserPositionHandle, Props>(
  ({ mapRef, positionRef }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const appRef = useRef<Application | null>(null)
    const prevPositionRef = useRef<{ lat: number; lng: number } | null>(null)
    const afterimagesRef = useRef<Afterimage[]>([])
    const ghostSpawnTimerRef = useRef(0)
    const isMovingRef = useRef(false)
    const avatarAlphaRef = useRef(1)
    const targetAvatarAlphaRef = useRef(1)
    const avatarRef = useRef<Graphics | null>(null)
    const ghostContainerRef = useRef<Container | null>(null)

    useImperativeHandle(
      ref,
      () => ({
        fadeIn: () => {
          isMovingRef.current = false
          targetAvatarAlphaRef.current = 1
        },
      }),
      [],
    )

    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      let mounted = true
      let app: Application | null = null
      let initFrame: number | null = null

      const spawnGhost = (lat: number, lng: number, timestamp: number) => {
        const ghostContainer = ghostContainerRef.current
        if (!ghostContainer) {
          return
        }
        const ghost = new Graphics()
        ghost.beginFill(0xa78bfa)
        ghost.drawCircle(0, 0, 1)
        ghost.endFill()
        ghost.alpha = 0
        ghostContainer.addChild(ghost)
        afterimagesRef.current = [
          ...afterimagesRef.current,
          {
            sprite: ghost,
            lat,
            lng,
            createdAt: timestamp,
            expiresAt: timestamp + AFTERIMAGE_LIFETIME_MS,
          },
        ].slice(-MAX_AFTERIMAGES)
      }

      const initPixi = async (map: MapboxMapInstance) => {
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

          const ghostContainer = new Container()
          const avatar = new Graphics()
          ghostContainerRef.current = ghostContainer
          avatarRef.current = avatar
          app.stage.addChild(ghostContainer)
          app.stage.addChild(avatar)

          app.ticker.add((ticker) => {
            const currentMap = mapRef.current?.getMap()
            if (!currentMap || !mounted || !app) {
              return
            }

            const mapContainer = currentMap.getContainer()
            const cssWidth = mapContainer.clientWidth
            const cssHeight = mapContainer.clientHeight
            if (
              app.screen.width !== cssWidth ||
              app.screen.height !== cssHeight
            ) {
              app.renderer.resize(cssWidth, cssHeight)
            }

            const { lat: currentLat, lng: currentLng } = positionRef.current
            const screenPoint = currentMap.project([currentLng, currentLat])
            const zoomScale = computeZoomScale(currentMap.getZoom())
            const scaledRadius = clampRadius(
              BASE_USER_RADIUS * zoomScale,
              MIN_USER_RADIUS,
              MAX_USER_RADIUS,
            )

            const avatarGraphic = avatarRef.current
            if (!avatarGraphic) {
              return
            }
            avatarGraphic.clear()
            avatarGraphic.beginFill(0xa78bfa)
            avatarGraphic.drawCircle(0, 0, scaledRadius)
            avatarGraphic.endFill()
            avatarGraphic.position.set(screenPoint.x, screenPoint.y)

            const deltaMs = ticker.deltaMS ?? (ticker.deltaTime / 60) * 1000
            const now = performance.now()

            const prevPosition = prevPositionRef.current ?? {
              lat: currentLat,
              lng: currentLng,
            }
            const moved =
              Math.abs(currentLat - prevPosition.lat) > MOVEMENT_EPSILON ||
              Math.abs(currentLng - prevPosition.lng) > MOVEMENT_EPSILON
            prevPositionRef.current = { lat: currentLat, lng: currentLng }

            if (moved) {
              ghostSpawnTimerRef.current += deltaMs
              if (!isMovingRef.current) {
                isMovingRef.current = true
                targetAvatarAlphaRef.current = 0
                spawnGhost(currentLat, currentLng, now)
              }
              while (ghostSpawnTimerRef.current >= AFTERIMAGE_INTERVAL_MS) {
                ghostSpawnTimerRef.current -= AFTERIMAGE_INTERVAL_MS
                spawnGhost(currentLat, currentLng, now)
              }
            } else {
              ghostSpawnTimerRef.current = 0
              if (isMovingRef.current) {
                isMovingRef.current = false
                targetAvatarAlphaRef.current = 1
                afterimagesRef.current.forEach((ghost) => {
                  if (!ghost.sprite.destroyed) {
                    ghost.sprite.destroy()
                  }
                })
                afterimagesRef.current = []
                ghostContainerRef.current?.removeChildren()
              }
            }

            const remainingGhosts: Afterimage[] = []
            for (const ghost of afterimagesRef.current) {
              if (now >= ghost.expiresAt) {
                if (!ghost.sprite.destroyed) {
                  ghost.sprite.destroy()
                }
                continue
              }
              const ghostPoint = currentMap.project([ghost.lng, ghost.lat])
              ghost.sprite.position.set(ghostPoint.x, ghostPoint.y)
              ghost.sprite.scale.set(scaledRadius)
              const lifeProgress =
                (now - ghost.createdAt) / AFTERIMAGE_LIFETIME_MS
              const fadeValue = Math.max(0, Math.min(1, lifeProgress))
              ghost.sprite.alpha = 1 - fadeValue
              remainingGhosts.push(ghost)
            }
            afterimagesRef.current = remainingGhosts

            const avatarAlpha = avatarAlphaRef.current
            const targetAlpha = targetAvatarAlphaRef.current
            if (avatarAlpha !== targetAlpha) {
              const direction = targetAlpha > avatarAlpha ? 1 : -1
              const deltaAlpha = (deltaMs / AVATAR_FADE_DURATION_MS) * direction
              let nextAlpha = avatarAlpha + deltaAlpha
              if (
                (direction > 0 && nextAlpha >= targetAlpha) ||
                (direction < 0 && nextAlpha <= targetAlpha)
              ) {
                nextAlpha = targetAlpha
              }
              avatarAlphaRef.current = nextAlpha
              avatarGraphic.alpha = nextAlpha
            } else {
              avatarGraphic.alpha = targetAlpha
            }
          })
        } catch (err) {
          console.error("Failed to initialize Pixi application:", err)
        }
      }

      const scheduleInit = () => {
        const map = mapRef.current?.getMap()
        if (!map) {
          initFrame = requestAnimationFrame(scheduleInit)
          return
        }
        initPixi(map)
      }

      scheduleInit()

      // Cleanup
      return () => {
        mounted = false
        if (initFrame !== null) {
          cancelAnimationFrame(initFrame)
          initFrame = null
        }
        afterimagesRef.current.forEach((ghost) => {
          if (!ghost.sprite.destroyed) {
            ghost.sprite.destroy()
          }
        })
        afterimagesRef.current = []
        ghostSpawnTimerRef.current = 0
        avatarAlphaRef.current = 1
        targetAvatarAlphaRef.current = 1
        avatarRef.current = null
        ghostContainerRef.current = null

        if (appRef.current) {
          appRef.current.destroy(true, { children: true })
          appRef.current = null
        }
      }
    }, [mapRef, positionRef])

    return <div ref={containerRef} className={canvasContainer} />
  },
)

UserPositionCanvas.displayName = "UserPositionCanvas"
