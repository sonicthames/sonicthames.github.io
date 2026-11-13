import type { ApplicationOptions, Ticker } from "pixi.js"
import { Application } from "pixi.js"
import { addToSharedTicker } from "./pixiTicker"

interface PixiOverlayConfig<State> {
  readonly container: HTMLElement
  readonly init: (
    app: Application,
    container: HTMLElement,
  ) => Promise<State> | State
  readonly onTick: (state: State, ticker: Ticker) => void
  readonly onDestroy?: (state: State) => void
}

/**
 * Options for a transparent overlay sized to the map container. The shared
 * ticker drives rendering, so the app's own ticker must not also render.
 */
export const overlayInitOptions = (
  mapContainer: HTMLElement,
): Partial<ApplicationOptions> => ({
  backgroundAlpha: 0,
  antialias: true,
  autoStart: false,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  autoDensity: true,
  width: mapContainer.clientWidth,
  height: mapContainer.clientHeight,
})

export const createPixiOverlay = async <State>({
  container,
  init,
  onTick,
  onDestroy,
}: PixiOverlayConfig<State>): Promise<() => void> => {
  const app = new Application()
  const state = await init(app, container)

  const removeTicker = addToSharedTicker((ticker) => onTick(state, ticker))

  return () => {
    removeTicker()
    onDestroy?.(state)
    if (app.canvas.parentNode === container) {
      container.removeChild(app.canvas)
    }
    app.destroy(true, { children: true })
  }
}
