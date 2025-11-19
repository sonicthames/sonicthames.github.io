/**
 * Shared utilities for Mapbox canvas overlays (PIXI.js and Canvas 2D).
 *
 * These utilities handle common patterns across SoundMarkersCanvas,
 * UserPositionCanvas, and MapFogOverlay:
 * - Canvas dimension synchronization with Mapbox container
 * - Geographic coordinate to screen pixel projection
 * - Zoom-aware scaling calculations
 * - Radius clamping
 */

import type { Map as MapboxMapInstance } from "mapbox-gl"
import type { Application } from "pixi.js"

/**
 * Clamps a value between min and max bounds.
 */
export const clampValue = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max))

/**
 * Projects geographic coordinates to screen pixels using Mapbox's projection.
 */
export const projectToScreen = (
  map: MapboxMapInstance,
  lng: number,
  lat: number,
): { x: number; y: number } => {
  const point = map.project([lng, lat])
  return { x: point.x, y: point.y }
}

/**
 * Synchronizes PIXI.js renderer dimensions with the Mapbox container.
 * Returns true if resize occurred, false if dimensions unchanged.
 */
export const syncPixiRendererSize = (
  app: Application,
  map: MapboxMapInstance,
): boolean => {
  const container = map.getContainer()
  const cssWidth = container.clientWidth
  const cssHeight = container.clientHeight

  if (app.screen.width !== cssWidth || app.screen.height !== cssHeight) {
    app.renderer.resize(cssWidth, cssHeight)
    return true
  }

  return false
}

/**
 * Synchronizes Canvas 2D dimensions with device pixel ratio for sharp rendering.
 * Returns the DPR used for scaling.
 */
export const syncCanvasSize = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): number => {
  const dpr = window.devicePixelRatio || 1

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  return dpr
}

/**
 * Converts meters to pixels at a given latitude and zoom level.
 * Uses Web Mercator projection formula.
 */
export const metersToPixels = (
  meters: number,
  latitude: number,
  zoom: number,
): number => {
  const metersPerPixel =
    (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom
  return meters / metersPerPixel
}
