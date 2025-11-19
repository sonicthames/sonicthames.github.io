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
export const computeZoomProgress = (zoom: number): number => {
  if (zoom <= ZOOM_MIN_LEVEL) return 0
  if (zoom >= ZOOM_MAX_LEVEL) return 1
  return (zoom - ZOOM_MIN_LEVEL) / (ZOOM_MAX_LEVEL - ZOOM_MIN_LEVEL)
}

/**
 * Computes a non-linear zoom scale where higher zoom levels (zooming in) make
 * markers larger while zooming out keeps them closer to the minimum scale.
 */
export const computeZoomScale = (zoom: number): number => {
  const progress = computeZoomProgress(zoom)
  const eased = progress ** ZOOM_SCALE_CURVE
  return ZOOM_SCALE_MIN + (ZOOM_SCALE_MAX - ZOOM_SCALE_MIN) * eased
}

/**
 * Computes a linear zoom scale between min and max values.
 * Unlike computeZoomScale, this uses linear interpolation.
 */
export const computeLinearZoomScale = (
  zoom: number,
  min: number,
  max: number,
): number => {
  const progress = computeZoomProgress(zoom)
  return min + progress * (max - min)
}

/**
 * Scales a base radius with zoom and clamps to min/max bounds.
 * Common pattern used across all canvas overlays.
 */
export const scaleAndClampRadius = (
  baseRadius: number,
  zoomScale: number,
  additionalScale: number,
  minRadius: number,
  maxRadius: number,
): number => {
  const scaled = baseRadius * zoomScale * additionalScale
  return Math.max(minRadius, Math.min(scaled, maxRadius))
}
