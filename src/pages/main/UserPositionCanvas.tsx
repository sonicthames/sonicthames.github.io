import { Application, Container, Graphics } from "pixi.js"
import { useEffect, useRef } from "react"
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
const AFTERIMAGE_INTERVAL_MS = 1500
const AFTERIMAGE_LIFETIME_MS = 1000
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

/**
 * User position indicator rendered on a Pixi.js canvas overlay with discrete
 * afterimages that appear while the avatar moves.
 */
export const UserPositionCanvas = ({ mapRef, positionRef }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const prevPositionRef = useRef(positionRef.current)
  const afterimagesRef = useRef<Afterimage[]>([])
  const ghostSpawnTimerRef = useRef(0)
  const isMovingRef = useRef(false)
  const avatarAlphaRef = useRef(1)
  const targetAvatarAlphaRef = useRef(1)

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

        // Apply CSS class to canvas for styling
        app.canvas.className = pixiCanvas

        container.appendChild(app.canvas)

        // Create containers
        const ghostContainer = new Container()
        const avatar = new Graphics()
        app.stage.addChild(ghostContainer)
        app.stage.addChild(avatar)

        // Animation loop
        app.ticker.add((ticker) => {
          const currentMap = mapRef.current?.getMap()
          if (!currentMap || !mounted || !app) return

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

          avatar.clear()
          avatar.beginFill(0xa78bfa)
          avatar.drawCircle(0, 0, scaledRadius)
          avatar.endFill()
          avatar.position.set(screenPoint.x, screenPoint.y)

          const deltaMs = ticker.deltaMS ?? (ticker.deltaTime / 60) * 1000
          const now = performance.now()

          const prevPosition = prevPositionRef.current
          const moved =
            Math.abs(currentLat - prevPosition.lat) > MOVEMENT_EPSILON ||
            Math.abs(currentLng - prevPosition.lng) > MOVEMENT_EPSILON
          prevPositionRef.current = { lat: currentLat, lng: currentLng }

          if (moved) {
            ghostSpawnTimerRef.current += deltaMs
            if (!isMovingRef.current) {
              isMovingRef.current = true
              targetAvatarAlphaRef.current = 0
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
                  lat: currentLat,
                  lng: currentLng,
                  createdAt: now,
                  expiresAt: now + AFTERIMAGE_LIFETIME_MS,
                },
              ].slice(-MAX_AFTERIMAGES)
            }
            while (ghostSpawnTimerRef.current >= AFTERIMAGE_INTERVAL_MS) {
              ghostSpawnTimerRef.current -= AFTERIMAGE_INTERVAL_MS
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
                  lat: currentLat,
                  lng: currentLng,
                  createdAt: now,
                  expiresAt: now + AFTERIMAGE_LIFETIME_MS,
                },
              ].slice(-MAX_AFTERIMAGES)
            }
          } else {
            ghostSpawnTimerRef.current = 0
            if (isMovingRef.current) {
              isMovingRef.current = false
              targetAvatarAlphaRef.current = 1
              afterimagesRef.current.forEach((ghost) => {
                ghost.sprite.destroy()
              })
              afterimagesRef.current = []
              ghostContainer.removeChildren()
            }
          }

          const remainingGhosts: Afterimage[] = []
          for (const ghost of afterimagesRef.current) {
            if (now >= ghost.expiresAt) {
              ghost.sprite.destroy()
            } else {
              const ghostPoint = currentMap.project([ghost.lng, ghost.lat])
              ghost.sprite.position.set(ghostPoint.x, ghostPoint.y)
              ghost.sprite.scale.set(scaledRadius)
              const lifeProgress =
                (now - ghost.createdAt) / AFTERIMAGE_LIFETIME_MS
              const fadeValue = Math.max(0, Math.min(1, lifeProgress))
              ghost.sprite.alpha = 1 - fadeValue
              remainingGhosts.push(ghost)
            }
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
            avatar.alpha = nextAlpha
          } else {
            avatar.alpha = targetAlpha
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
      afterimagesRef.current.forEach((ghost) => {
        ghost.sprite.destroy()
      })
      afterimagesRef.current = []

      if (appRef.current) {
        appRef.current.destroy(true, { children: true })
        appRef.current = null
      }
    }
  }, [mapRef, positionRef])

  return <div ref={containerRef} className={canvasContainer} />
}
