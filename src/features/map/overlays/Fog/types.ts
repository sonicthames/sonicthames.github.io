import type mapboxgl from "mapbox-gl"

/**
 * Persisted grid cell index for fog-of-war reveals.
 * Cells are indexed in a Mercator-aligned grid to keep geographic size stable.
 */
export type PersistedRevealCell = {
  readonly col: number // Grid column
  readonly row: number // Grid row
}

export type PersistedReveal = {
  readonly lng: number
  readonly lat: number
}

/**
 * RevealPoint stores resolved cell centers for rendering.
 * Each point corresponds to a fixed-size grid cell on the map.
 */
export type RevealPoint = PersistedRevealCell & {
  readonly key: number // Stable cache key for sets/maps
  readonly lng: number // Cell center longitude
  readonly lat: number // Cell center latitude
  readonly radiusMeters: number // Visual radius in meters (typically tied to cell size)
}

/**
 * Grid transform used to snap reveals to fixed-size world cells.
 */
export type FogGrid = {
  readonly origin: mapboxgl.MercatorCoordinate
  readonly unitsPerMeter: number
  readonly cellSizeMeters: number
  readonly cellSizeUnits: number
  readonly startCol: number
  readonly startRow: number
  readonly endCol: number
  readonly endRow: number
  readonly width: number
  readonly height: number
  readonly visualCellRadiusMeters: number
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
