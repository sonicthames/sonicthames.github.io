import type { LngLat, LngLatLike, Map as MapboxMapInstance } from "mapbox-gl"
import { Application, Container, Graphics } from "pixi.js"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { mapColorTheme } from "@/theme/mapColors"
import { syncPixiRendererSize } from "../../lib/mapCanvas"
import { computeZoomScale, scaleAndClampRadius } from "../../lib/zoomScale"
import { canvasContainer, pixiCanvas } from "./UserPositionCanvas.css"

const AFTERIMAGE_FADE_DURATION_MS = 350
const AFTERIMAGE_INTERVAL_MS = 700
const AFTERIMAGE_LIFETIME_MS = 800
const hexToPixiColor = (hex: string): number =>
  Number.parseInt(hex.replace("#", ""), 16)
const AVATAR_COLOR = hexToPixiColor(mapColorTheme.userAvatarColor)
const AVATAR_FADE_DURATION_MS = 350
const BASE_USER_RADIUS = 8
const MAX_AFTERIMAGES = 4
const MAX_USER_RADIUS = 16
const MIN_USER_RADIUS = 4
const MOVEMENT_EPSILON = 1e-5

type Afterimage = {
  sprite: Graphics
  coordinate: LngLatLike
  createdAt: number
  expiresAt: number
}

export interface UserPositionHandle {
  readonly fadeIn: () => void
}

interface Props {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly positionRef: React.MutableRefObject<LngLat>
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

      const spawnGhost = (coordinate: LngLat, timestamp: number) => {
        const ghostContainer = ghostContainerRef.current
        if (!ghostContainer) {
          return
        }
        const ghost = new Graphics()
        ghost.circle(0, 0, 1)
        ghost.fill({ color: AVATAR_COLOR })
        ghost.alpha = 0
        ghostContainer.addChild(ghost)
        afterimagesRef.current = [
          ...afterimagesRef.current,
          {
            sprite: ghost,
            coordinate,
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

            syncPixiRendererSize(app, currentMap)

            const screenPoint = currentMap.project(positionRef.current)
            const zoomScale = computeZoomScale(currentMap.getZoom())
            const scaledRadius = scaleAndClampRadius(
              BASE_USER_RADIUS,
              zoomScale,
              1,
              MIN_USER_RADIUS,
              MAX_USER_RADIUS,
            )
            const deltaMs = ticker.deltaMS ?? (ticker.deltaTime / 60) * 1000
            const now = performance.now()

            const avatarGraphic = avatarRef.current
            if (!avatarGraphic) {
              return
            }
            avatarGraphic.clear()
            avatarGraphic.circle(0, 0, scaledRadius)
            avatarGraphic.fill({ color: AVATAR_COLOR })
            avatarGraphic.position.set(screenPoint.x, screenPoint.y)

            const prevPosition = prevPositionRef.current ?? positionRef.current
            const moved =
              Math.abs(positionRef.current.lat - prevPosition.lat) >
                MOVEMENT_EPSILON ||
              Math.abs(positionRef.current.lng - prevPosition.lng) >
                MOVEMENT_EPSILON
            prevPositionRef.current = positionRef.current

            if (moved) {
              ghostSpawnTimerRef.current += deltaMs
              if (!isMovingRef.current) {
                isMovingRef.current = true
                targetAvatarAlphaRef.current = 0
                spawnGhost(positionRef.current, now)
              }
              while (ghostSpawnTimerRef.current >= AFTERIMAGE_INTERVAL_MS) {
                ghostSpawnTimerRef.current -= AFTERIMAGE_INTERVAL_MS
                spawnGhost(positionRef.current, now)
              }
            } else {
              ghostSpawnTimerRef.current = 0
              // Ensure avatar is always visible when not moving
              if (targetAvatarAlphaRef.current !== 1) {
                targetAvatarAlphaRef.current = 1
              }
              if (isMovingRef.current) {
                isMovingRef.current = false
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
              const ghostPoint = currentMap.project(ghost.coordinate)
              ghost.sprite.position.set(ghostPoint.x, ghostPoint.y)
              ghost.sprite.scale.set(scaledRadius)
              const elapsed = now - ghost.createdAt
              const fadeWindow = Math.min(
                AFTERIMAGE_FADE_DURATION_MS,
                AFTERIMAGE_LIFETIME_MS,
              )
              const fadeStart = AFTERIMAGE_LIFETIME_MS - fadeWindow
              let alpha = 1
              if (fadeWindow > 0 && elapsed >= fadeStart) {
                const fadeProgress = Math.min(
                  1,
                  (elapsed - fadeStart) / fadeWindow,
                )
                alpha = Math.max(0, 1 - fadeProgress)
              }
              ghost.sprite.alpha = alpha
              remainingGhosts.push(ghost)
            }
            afterimagesRef.current = remainingGhosts

            const avatarAlpha = avatarAlphaRef.current
            const targetAlpha = targetAvatarAlphaRef.current
            if (Math.abs(avatarAlpha - targetAlpha) > 0.001) {
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
              avatarGraphic.alpha = Math.max(0, Math.min(1, nextAlpha))
            } else {
              avatarAlphaRef.current = targetAlpha
              avatarGraphic.alpha = Math.max(0, Math.min(1, targetAlpha))
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
