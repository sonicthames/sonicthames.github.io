import { Application, Graphics } from "pixi.js"
import { useEffect, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"
import { canvasContainer, pixiCanvas } from "./UserPositionCanvas.css"
import { computeZoomScale } from "./zoomScale"

interface Props {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly latitude: number
  readonly longitude: number
}

const BASE_USER_RADIUS = 8
const MIN_USER_RADIUS = 4
const MAX_USER_RADIUS = 16

const clampRadius = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max))

/**
 * User position indicator rendered on a Pixi.js canvas overlay.
 * Shows a pulsating brightness effect.
 */
export const UserPositionCanvas = ({ mapRef, latitude, longitude }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const pulseAge = useRef(0)

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

        // Create center dot
        const dot = new Graphics()
        app.stage.addChild(dot)

        // Animation loop
        app.ticker.add((ticker) => {
          const currentMap = mapRef.current?.getMap()
          if (!currentMap || !mounted || !app) return

          // Update canvas size if map resized
          const mapContainer = currentMap.getContainer()
          const cssWidth = mapContainer.clientWidth
          const cssHeight = mapContainer.clientHeight
          if (
            app.screen.width !== cssWidth ||
            app.screen.height !== cssHeight
          ) {
            app.renderer.resize(cssWidth, cssHeight)
          }

          // Get pixel coordinates for user position
          const point = currentMap.project([longitude, latitude])

          // Clear graphics
          dot.clear()

          // Update pulse animation
          const deltaTime = ticker.deltaTime / 60
          pulseAge.current += deltaTime

          const pulseCycle = 2.0
          if (pulseAge.current >= pulseCycle) {
            pulseAge.current = 0
          }

          // Calculate luminosity variation (0 to 1)
          const progress = pulseAge.current / pulseCycle
          const luminosity = 0.5 + Math.sin(progress * Math.PI * 2) * 0.5

          // Interpolate between base purple and lighter purple
          const basePurple = { r: 0xa7, g: 0x8b, b: 0xfa }
          const lightPurple = { r: 0xdd, g: 0xc3, b: 0xff }

          const r = Math.round(
            basePurple.r + (lightPurple.r - basePurple.r) * luminosity,
          )
          const g = Math.round(
            basePurple.g + (lightPurple.g - basePurple.g) * luminosity,
          )
          const b = Math.round(
            basePurple.b + (lightPurple.b - basePurple.b) * luminosity,
          )
          const color = (r << 16) | (g << 8) | b

          const currentZoom = currentMap.getZoom()
          const zoomScale = computeZoomScale(currentZoom)
          const scaledRadius = clampRadius(
            BASE_USER_RADIUS * zoomScale,
            MIN_USER_RADIUS,
            MAX_USER_RADIUS,
          )
          const glowThickness = 2 * zoomScale

          // Draw outer glow
          dot.circle(point.x, point.y, scaledRadius + glowThickness)
          dot.fill({ color, alpha: 0.5 })

          // Draw inner core
          dot.circle(point.x, point.y, scaledRadius)
          dot.fill({ color, alpha: 1 })
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
    }
  }, [mapRef, latitude, longitude])

  return <div ref={containerRef} className={canvasContainer} />
}
