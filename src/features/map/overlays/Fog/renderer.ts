import type * as mapboxgl from "mapbox-gl"
import type { LngLatBounds } from "mapbox-gl"
import { getRevealTexture } from "./texture"
import type { RevealScreenSpace } from "./types"

const drawRevealWithTexture = (
  ctx: CanvasRenderingContext2D,
  reveal: RevealScreenSpace,
): void => {
  ctx.drawImage(
    getRevealTexture(),
    reveal.x - reveal.radiusPixels,
    reveal.y - reveal.radiusPixels,
    reveal.radiusPixels * 2,
    reveal.radiusPixels * 2,
  )
}

/**
 * Draw all reveals using the shared reveal texture.
 * Imperative batch rendering for performance.
 *
 * Performance: O(n) where n = visible reveals
 * Uses destination-out compositing to punch holes in fog
 */
export const drawReveals = (
  ctx: CanvasRenderingContext2D,
  reveals: readonly RevealScreenSpace[],
): void => {
  if (reveals.length === 0) return

  // Set composite mode to punch holes in fog
  ctx.globalCompositeOperation = "destination-out"

  // Imperative loop for performance
  for (const reveal of reveals) {
    drawRevealWithTexture(ctx, reveal)
  }

  // Reset composite mode
  ctx.globalCompositeOperation = "source-over"
}

/**
 * Draw fog over areas outside the movement bounds.
 * Creates the outer boundary using even-odd fill rule.
 *
 * Performance: O(1) - two rectangle draws
 */
export const drawOuterFogBoundary = (
  ctx: CanvasRenderingContext2D,
  map: mapboxgl.Map,
  movementBounds: LngLatBounds,
  canvasWidth: number,
  canvasHeight: number,
  intensity: number,
): void => {
  // Project movement bounds corners to screen coordinates
  const sw = movementBounds.getSouthWest()
  const ne = movementBounds.getNorthEast()

  const swScreen = map.project(sw)
  const neScreen = map.project(ne)

  // Calculate movement bounds rectangle in screen space
  const boundLeft = Math.min(swScreen.x, neScreen.x)
  const boundRight = Math.max(swScreen.x, neScreen.x)
  const boundTop = Math.min(swScreen.y, neScreen.y)
  const boundBottom = Math.max(swScreen.y, neScreen.y)

  // Save context state
  ctx.save()

  // Create compound path: outer rectangle (full canvas) with inner hole (movement bounds)
  ctx.beginPath()
  // Outer rectangle (full canvas)
  ctx.rect(0, 0, canvasWidth, canvasHeight)
  // Inner rectangle (movement bounds) - drawn counter-clockwise to create hole
  ctx.rect(boundLeft, boundTop, boundRight - boundLeft, boundBottom - boundTop)
  ctx.closePath()

  // Fill with fog (even-odd fill rule creates the hole)
  ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, intensity)})`
  ctx.fill("evenodd")

  // Restore context state
  ctx.restore()
}
