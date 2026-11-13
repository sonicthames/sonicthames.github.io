import { Ticker } from "pixi.js"

const sharedTicker = Ticker.shared
// With autoStart, adding a listener restarts a stopped ticker and undoes a pause.
sharedTicker.autoStart = false
sharedTicker.start()

export const addToSharedTicker = (
  handler: (ticker: Ticker) => void,
): (() => void) => {
  sharedTicker.add(handler)
  if (!sharedTicker.started) {
    handler(sharedTicker)
  }
  return () => sharedTicker.remove(handler)
}

export const pauseSharedTicker = () => {
  if (sharedTicker.started) {
    sharedTicker.stop()
  }
}

export const resumeSharedTicker = () => {
  if (!sharedTicker.started) {
    sharedTicker.start()
  }
}

/** Runs the listeners once, for a paused ticker. */
export const stepSharedTicker = () => {
  sharedTicker.update()
}
