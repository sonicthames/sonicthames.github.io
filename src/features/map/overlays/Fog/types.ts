/**
 * RevealPoint stores where the user has explored.
 * Uses geographic coordinates so reveals stay in the same location on the map
 * regardless of zoom/pan operations.
 */
export type RevealPoint = {
  readonly lng: number // Longitude (geographic coordinate)
  readonly lat: number // Latitude (geographic coordinate)
  readonly radiusMeters: number // Radius in meters (geographic distance)
}

/**
 * Screen-space representation of a reveal for rendering
 */
export type RevealScreenSpace = {
  readonly x: number // Screen X coordinate
  readonly y: number // Screen Y coordinate
  readonly radiusPixels: number // Radius in pixels
}

/**
 * Viewport bounds in screen space
 */
export type ViewportBounds = {
  readonly width: number
  readonly height: number
}

/**
 * Configuration for fog rendering
 */
export type FogConfig = {
  readonly intensity: number // 0-1, controls fog opacity
  readonly fixedRevealRadiusMeters: number // Fixed reveal radius in meters
  readonly maxReveals: number // Maximum number of reveals to store
  readonly persistDebounceMs: number // Debounce time for localStorage writes
  readonly revealDistanceThreshold: number // Threshold for adding new reveals (multiplier of revealSize)
}
