import type mapboxgl from "mapbox-gl"
import { metersToPixels, projectToScreen } from "../../lib/mapCanvas"
import type { RevealPoint, RevealScreenSpace, ViewportBounds } from "./types"

/**
 * Check if a reveal is visible within the viewport.
 * Pure function, no side effects.
 *
 * Performance: O(1) bounding box check
 */
export const isRevealVisible = (
  reveal: RevealPoint,
  map: mapboxgl.Map,
  viewport: ViewportBounds,
  currentZoom: number,
): boolean => {
  const screen = projectToScreen(map, reveal.lng, reveal.lat)
  const radiusPixels = metersToPixels(
    reveal.radiusMeters,
    reveal.lat,
    currentZoom,
  )

  // Bounding box check with buffer for edge cases
  const buffer = radiusPixels * 0.1 // 10% buffer to avoid popping
  return (
    screen.x + radiusPixels >= -buffer &&
    screen.x - radiusPixels <= viewport.width + buffer &&
    screen.y + radiusPixels >= -buffer &&
    screen.y - radiusPixels <= viewport.height + buffer
  )
}

/**
 * Filter reveals to only those visible in viewport.
 * Pure function using imperative loop for performance.
 *
 * Performance: O(n) where n = total reveals
 * Typical speedup: 2-3× by skipping off-screen rendering
 */
export const cullRevealsToViewport = (
  reveals: readonly RevealPoint[],
  map: mapboxgl.Map,
  viewport: ViewportBounds,
  currentZoom: number,
): readonly RevealPoint[] => {
  // Imperative loop for performance (faster than .filter for large arrays)
  const visible: RevealPoint[] = []

  for (let i = 0; i < reveals.length; i++) {
    const reveal = reveals[i]
    if (isRevealVisible(reveal, map, viewport, currentZoom)) {
      visible.push(reveal)
    }
  }

  return visible
}

/**
 * Project reveals to screen space for rendering.
 * Pure function using imperative loop for performance.
 *
 * Performance: O(n) where n = visible reveals
 */
export const projectRevealsToScreen = (
  reveals: readonly RevealPoint[],
  map: mapboxgl.Map,
  currentZoom: number,
): readonly RevealScreenSpace[] => {
  const projected: RevealScreenSpace[] = new Array(reveals.length)

  for (let i = 0; i < reveals.length; i++) {
    const reveal = reveals[i]
    const screen = projectToScreen(map, reveal.lng, reveal.lat)
    const radiusPixels = metersToPixels(
      reveal.radiusMeters,
      reveal.lat,
      currentZoom,
    )

    projected[i] = {
      x: screen.x,
      y: screen.y,
      radiusPixels,
    }
  }

  return projected
}
