import { Ticker } from "pixi.js"

const sharedTicker = Ticker.shared
sharedTicker.autoStart = true
sharedTicker.start()

export const addToSharedTicker = (
  handler: (ticker: Ticker) => void,
): (() => void) => {
  sharedTicker.add(handler)
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
