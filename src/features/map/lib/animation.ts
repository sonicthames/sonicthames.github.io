import { interpolateNumber, interpolateRgb } from "d3-interpolate"

export const interpolateColorNumber = (
  current: string,
  target: string,
  factor: number,
): string => {
  if (factor <= 0) return current
  if (factor >= 1) return target

  return interpolateRgb(current, target)(factor)
}

export const smoothValue = (
  current: number,
  target: number,
  deltaMs: number,
  transitionMs: number,
): number => {
  if (transitionMs <= 0) {
    return target
  }
  const interpolator = interpolateNumber(current, target)
  return interpolator(Math.min(1, deltaMs / transitionMs))
}
