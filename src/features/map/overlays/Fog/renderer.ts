import type * as mapboxgl from "mapbox-gl"
import type { LngLatBounds } from "mapbox-gl"
import type { TextureCache } from "./texture"
import { getCachedRevealTexture } from "./texture"
import type { RevealScreenSpace } from "./types"

/**
 * Draw a single reveal circle using cached texture.
 * Imperative rendering for performance.
 *
 * @param ctx - Canvas rendering context
 * @param textureCache - Texture cache for pre-rendered circles
 * @param reveal - Screen-space reveal position and size
 */
const drawRevealWithTexture = (
  ctx: CanvasRenderingContext2D,
  textureCache: TextureCache,
  reveal: RevealScreenSpace,
): void => {
  const texture = getCachedRevealTexture(textureCache, reveal.radiusPixels)

  // Draw cached texture at reveal position
  ctx.drawImage(
    texture,
    reveal.x - reveal.radiusPixels,
    reveal.y - reveal.radiusPixels,
    reveal.radiusPixels * 2,
    reveal.radiusPixels * 2,
  )
}

/**
 * Draw all reveals using cached textures.
 * Imperative batch rendering for performance.
 *
 * Performance: O(n) where n = visible reveals
 * Uses destination-out compositing to punch holes in fog
 */
export const drawReveals = (
  ctx: CanvasRenderingContext2D,
  textureCache: TextureCache,
  reveals: readonly RevealScreenSpace[],
): void => {
  if (reveals.length === 0) return

  // Set composite mode to punch holes in fog
  ctx.globalCompositeOperation = "destination-out"

  // Imperative loop for performance
  for (const reveal of reveals) {
    drawRevealWithTexture(ctx, textureCache, reveal)
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
