import { easeLinear } from "d3-ease"
import { timer } from "d3-timer"

type EasingFn = (t: number) => number

interface TweenOptions {
  readonly from: number
  readonly to: number
  readonly durationMs: number
  readonly ease?: EasingFn
  readonly onUpdate: (value: number) => void
  readonly onComplete?: () => void
}

export const tween = ({
  from,
  to,
  durationMs,
  ease = easeLinear,
  onUpdate,
  onComplete,
}: TweenOptions): (() => void) => {
  const interpolator = (t: number) => from + (to - from) * t
  onUpdate(from)

  const handle = timer((elapsed) => {
    const rawProgress = durationMs === 0 ? 1 : Math.min(1, elapsed / durationMs)
    const eased = ease(rawProgress)
    onUpdate(interpolator(eased))
    if (rawProgress >= 1) {
      handle.stop()
      onComplete?.()
    }
  })

  return () => {
    handle.stop()
  }
}
