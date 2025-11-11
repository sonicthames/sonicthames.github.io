import { Application, Graphics } from "pixi.js"
import { useEffect, useRef } from "react"
import type { MapRef } from "react-map-gl/mapbox"

interface Props {
  readonly mapRef: React.RefObject<MapRef | null>
  readonly latitude: number
  readonly longitude: number
}

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
        app.canvas.style.pointerEvents = "none"
        app.canvas.style.zIndex = "1"

        container.appendChild(app.canvas)

        // Create center dot
        const dot = new Graphics()
        app.stage.addChild(dot)

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

          // Get pixel coordinates for user position
          const point = map.project([longitude, latitude])

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

          // Draw outer glow
          dot.circle(point.x, point.y, 8)
          dot.fill({ color, alpha: 0.5 })

          // Draw inner core
          dot.circle(point.x, point.y, 6)
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
