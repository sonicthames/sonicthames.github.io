/** Minimum multiplier applied when the map is fully zoomed out. */
export const ZOOM_SCALE_MIN = 0.6
/** Maximum multiplier applied when the map is fully zoomed in. */
export const ZOOM_SCALE_MAX = 1.8
/** The zoom level that results in `ZOOM_SCALE_MIN`. */
export const ZOOM_MIN_LEVEL = 10
/** The zoom level that results in `ZOOM_SCALE_MAX`. */
export const ZOOM_MAX_LEVEL = 18
const ZOOM_SCALE_CURVE = 0.65

/** Returns how far the current zoom sits between `ZOOM_MIN_LEVEL` and `ZOOM_MAX_LEVEL`. */
export const computeZoomProgress = (zoom: number) => {
  if (zoom <= ZOOM_MIN_LEVEL) return 0
  if (zoom >= ZOOM_MAX_LEVEL) return 1
  return (zoom - ZOOM_MIN_LEVEL) / (ZOOM_MAX_LEVEL - ZOOM_MIN_LEVEL)
}

/**
 * Computes a non-linear zoom scale where higher zoom levels (zooming in) make
 * markers larger while zooming out keeps them closer to the minimum scale.
 */
export const computeZoomScale = (zoom: number) => {
  const progress = computeZoomProgress(zoom)
  const eased = progress ** ZOOM_SCALE_CURVE
  return ZOOM_SCALE_MIN + (ZOOM_SCALE_MAX - ZOOM_SCALE_MIN) * eased
}
