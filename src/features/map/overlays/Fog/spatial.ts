import type { LngLat, LngLatBounds, Map as MapboxMap } from "mapbox-gl"
import { MercatorCoordinate } from "mapbox-gl"
import { metersToPixels } from "../../lib/mapCanvas"
import type {
  FogGrid,
  PersistedReveal,
  PersistedRevealCell,
  RevealPoint,
  RevealScreenSpace,
  ViewportBounds,
} from "./types"

const lngLatToCellRaw = (
  origin: MercatorCoordinate,
  cellSizeUnits: number,
  lng: number,
  lat: number,
): PersistedRevealCell => {
  const coord = MercatorCoordinate.fromLngLat({ lng, lat })
  const col = Math.floor((coord.x - origin.x) / cellSizeUnits)
  const row = Math.floor((coord.y - origin.y) / cellSizeUnits)
  return { col, row }
}

export const createFogGrid = (
  bounds: LngLatBounds,
  cellSizeMeters: number,
  visualCellRadiusMeters: number,
): FogGrid => {
  const sw = bounds.getSouthWest()
  const ne = bounds.getNorthEast()
  const origin = MercatorCoordinate.fromLngLat({ lng: sw.lng, lat: sw.lat })
  const unitsPerMeter = origin.meterInMercatorCoordinateUnits()
  const cellSizeUnits = unitsPerMeter * cellSizeMeters

  const swCell = lngLatToCellRaw(origin, cellSizeUnits, sw.lng, sw.lat)
  const neCell = lngLatToCellRaw(origin, cellSizeUnits, ne.lng, ne.lat)

  const startCol = Math.min(swCell.col, neCell.col)
  const startRow = Math.min(swCell.row, neCell.row)
  const endCol = Math.max(swCell.col, neCell.col)
  const endRow = Math.max(swCell.row, neCell.row)

  return {
    origin,
    unitsPerMeter,
    cellSizeMeters,
    cellSizeUnits,
    startCol,
    startRow,
    endCol,
    endRow,
    width: endCol - startCol + 1,
    height: endRow - startRow + 1,
    visualCellRadiusMeters,
  }
}

const cellCenterToLngLat = (
  grid: FogGrid,
  col: number,
  row: number,
): LngLat => {
  const x = grid.origin.x + (col + 0.5) * grid.cellSizeUnits
  const y = grid.origin.y + (row + 0.5) * grid.cellSizeUnits
  return new MercatorCoordinate(x, y).toLngLat()
}

const lngLatToCell = (
  grid: FogGrid,
  lng: number,
  lat: number,
): PersistedRevealCell => {
  return lngLatToCellRaw(grid.origin, grid.cellSizeUnits, lng, lat)
}

const cellIndex = (grid: FogGrid, col: number, row: number): number => {
  if (
    col < grid.startCol ||
    col > grid.endCol ||
    row < grid.startRow ||
    row > grid.endRow
  ) {
    return -1
  }

  return (row - grid.startRow) * grid.width + (col - grid.startCol)
}

export const resolveRevealPoint = (
  grid: FogGrid,
  col: number,
  row: number,
  radiusMeters: number,
): RevealPoint | null => {
  const key = cellIndex(grid, col, row)
  if (key === -1) {
    return null
  }

  const center = cellCenterToLngLat(grid, col, row)
  return {
    col,
    row,
    key,
    lng: center.lng,
    lat: center.lat,
    radiusMeters,
  }
}

export const collectCellsInRadius = (
  grid: FogGrid,
  center: { lng: number; lat: number },
  revealRadiusMeters: number,
  cellRadiusMeters: number,
  bounds?: LngLatBounds,
): RevealPoint[] => {
  const centerCoord = MercatorCoordinate.fromLngLat({
    lng: center.lng,
    lat: center.lat,
  })
  const centerCell = lngLatToCell(grid, center.lng, center.lat)
  const maxOffset = Math.ceil(
    (revealRadiusMeters + cellRadiusMeters) / grid.cellSizeMeters,
  )
  const revealRadiusUnits = revealRadiusMeters * grid.unitsPerMeter
  const cellRadiusUnits = cellRadiusMeters * grid.unitsPerMeter
  const cells: RevealPoint[] = []

  for (let rowOffset = -maxOffset; rowOffset <= maxOffset; rowOffset++) {
    for (let colOffset = -maxOffset; colOffset <= maxOffset; colOffset++) {
      const col = centerCell.col + colOffset
      const row = centerCell.row + rowOffset
      const key = cellIndex(grid, col, row)
      if (key === -1) continue

      const cellCenterX = grid.origin.x + (col + 0.5) * grid.cellSizeUnits
      const cellCenterY = grid.origin.y + (row + 0.5) * grid.cellSizeUnits
      const distanceUnits = Math.hypot(
        cellCenterX - centerCoord.x,
        cellCenterY - centerCoord.y,
      )

      if (distanceUnits > revealRadiusUnits + cellRadiusUnits) {
        continue
      }

      const resolved = resolveRevealPoint(grid, col, row, cellRadiusMeters)
      if (!resolved) continue
      if (
        bounds &&
        !bounds.contains({ lng: resolved.lng, lat: resolved.lat })
      ) {
        continue
      }

      cells.push(resolved)
    }
  }

  return cells
}

export const resolvePersistedReveals = (
  grid: FogGrid,
  reveals: readonly PersistedReveal[],
  cellRadiusMeters: number,
  bounds?: LngLatBounds,
): RevealPoint[] => {
  const normalized: RevealPoint[] = []

  for (const reveal of reveals) {
    const cell = lngLatToCell(grid, reveal.lng, reveal.lat)
    const snapped = resolveRevealPoint(
      grid,
      cell.col,
      cell.row,
      cellRadiusMeters,
    )
    if (
      snapped &&
      (!bounds || bounds.contains({ lng: snapped.lng, lat: snapped.lat }))
    ) {
      normalized.push(snapped)
    }
  }

  return normalized
}

export const collectCellsInBounds = (
  grid: FogGrid,
  bounds: LngLatBounds,
  cellRadiusMeters: number,
): RevealPoint[] => {
  const cells: RevealPoint[] = []

  for (let row = grid.startRow; row <= grid.endRow; row++) {
    for (let col = grid.startCol; col <= grid.endCol; col++) {
      const lngLat = cellCenterToLngLat(grid, col, row)
      if (!bounds.contains(lngLat)) continue
      const resolved = resolveRevealPoint(grid, col, row, cellRadiusMeters)
      if (resolved) {
        cells.push(resolved)
      }
    }
  }

  return cells
}

/**
 * Check if a reveal is visible within the viewport.
 * Pure function, no side effects.
 *
 * Performance: O(1) bounding box check
 */
export const isRevealVisible = (
  reveal: RevealPoint,
  map: MapboxMap,
  viewport: ViewportBounds,
  currentZoom: number,
): boolean => {
  const screen = map.project(reveal)
  const radiusPixels = renderRadiusPixels(reveal, currentZoom)

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
  map: MapboxMap,
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

const MIN_REVEAL_RADIUS_PIXELS = 2 // Prevent vanishingly small reveals when extremely zoomed out

const renderRadiusPixels = (
  reveal: RevealPoint,
  currentZoom: number,
): number => {
  const radiusMetersToPixels = metersToPixels(
    reveal.radiusMeters,
    reveal.lat,
    currentZoom,
  )

  return Math.max(radiusMetersToPixels, MIN_REVEAL_RADIUS_PIXELS)
}

/**
 * Project reveals to screen space for rendering.
 * Pure function using imperative loop for performance.
 *
 * Clamps pixel radius to maintain consistent visual bubble size across zoom levels
 * while preserving the geographic reveal area.
 *
 * Performance: O(n) where n = visible reveals
 */
export const projectRevealsToScreen = (
  reveals: readonly RevealPoint[],
  map: MapboxMap,
  currentZoom: number,
): readonly RevealScreenSpace[] => {
  const projected: RevealScreenSpace[] = new Array(reveals.length)

  for (let i = 0; i < reveals.length; i++) {
    const reveal = reveals[i]
    const screen = map.project(reveal)
    const radiusPixels = renderRadiusPixels(reveal, currentZoom)

    projected[i] = {
      x: screen.x,
      y: screen.y,
      radiusPixels,
    }
  }

  return projected
}
