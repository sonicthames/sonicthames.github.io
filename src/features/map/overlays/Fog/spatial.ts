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

const resolveRevealPoint = (
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

const tryCollectCell = (
  grid: FogGrid,
  col: number,
  row: number,
  centerCoord: MercatorCoordinate,
  revealRadiusUnits: number,
  cellRadiusUnits: number,
  cellRadiusMeters: number,
  bounds: LngLatBounds | undefined,
): RevealPoint | undefined => {
  const key = cellIndex(grid, col, row)
  if (key === -1) return undefined

  const cellCenterX = grid.origin.x + (col + 0.5) * grid.cellSizeUnits
  const cellCenterY = grid.origin.y + (row + 0.5) * grid.cellSizeUnits
  const distanceUnits = Math.hypot(
    cellCenterX - centerCoord.x,
    cellCenterY - centerCoord.y,
  )

  if (distanceUnits > revealRadiusUnits + cellRadiusUnits) {
    return undefined
  }

  const resolved = resolveRevealPoint(grid, col, row, cellRadiusMeters)
  if (!resolved) return undefined
  if (bounds && !bounds.contains({ lng: resolved.lng, lat: resolved.lat })) {
    return undefined
  }

  return resolved
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
      const cell = tryCollectCell(
        grid,
        col,
        row,
        centerCoord,
        revealRadiusUnits,
        cellRadiusUnits,
        cellRadiusMeters,
        bounds,
      )
      if (cell) {
        cells.push(cell)
      }
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
 * Projects the reveals that overlap the viewport to screen space, in one pass:
 * `map.project` is the expensive step, so each reveal is projected once.
 */
export const projectVisibleReveals = (
  reveals: Iterable<RevealPoint>,
  map: MapboxMap,
  viewport: ViewportBounds,
  currentZoom: number,
  out: RevealScreenSpace[] = [],
): readonly RevealScreenSpace[] => {
  let count = 0
  for (const reveal of reveals) {
    const radiusPixels = renderRadiusPixels(reveal, currentZoom)
    const screen = map.project(reveal)
    // A 10% margin keeps reveals at the edge from popping in and out.
    const reach = radiusPixels * 1.1
    if (
      screen.x + reach < 0 ||
      screen.x - reach > viewport.width ||
      screen.y + reach < 0 ||
      screen.y - reach > viewport.height
    ) {
      continue
    }
    out[count] = { x: screen.x, y: screen.y, radiusPixels }
    count += 1
  }
  out.length = count
  return out
}
