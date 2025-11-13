/** Minimum multiplier applied when the map is fully zoomed out. */
export const ZOOM_SCALE_MIN = 0.8
/** Maximum multiplier applied when the map is fully zoomed in. */
export const ZOOM_SCALE_MAX = 1.5
/** The zoom level that results in `ZOOM_SCALE_MIN`. */
export const ZOOM_MIN_LEVEL = 10
/** The zoom level that results in `ZOOM_SCALE_MAX`. */
export const ZOOM_MAX_LEVEL = 18
const ZOOM_SCALE_CURVE = 0.8

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

/**
 * Computes a non-linear zoom scale where higher zoom levels (zooming in) make
 * markers larger while zooming out keeps them closer to the minimum scale.
 * The output is clamped to [ZOOM_SCALE_MIN, ZOOM_SCALE_MAX].
 */
export const computeZoomScale = (zoom: number) => {
  const progress = clamp(
    (zoom - ZOOM_MIN_LEVEL) / (ZOOM_MAX_LEVEL - ZOOM_MIN_LEVEL),
    0,
    1,
  )
  const scaledProgress = progress ** ZOOM_SCALE_CURVE
  return ZOOM_SCALE_MIN + (ZOOM_SCALE_MAX - ZOOM_SCALE_MIN) * scaledProgress
}
