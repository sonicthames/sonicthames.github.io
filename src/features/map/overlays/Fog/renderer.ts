import type mapboxgl from "mapbox-gl"
import type { LngLatBounds } from "mapbox-gl"
import { projectToScreen } from "../../lib/mapCanvas"
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
export const drawRevealWithTexture = (
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
  for (let i = 0; i < reveals.length; i++) {
    drawRevealWithTexture(ctx, textureCache, reveals[i])
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

  const swScreen = projectToScreen(map, sw.lng, sw.lat)
  const neScreen = projectToScreen(map, ne.lng, ne.lat)

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

/**
 * Fallback: Draw a single reveal circle with radial gradient (no caching).
 * Used when OffscreenCanvas is unavailable or for testing.
 *
 * This is the original implementation - kept for compatibility.
 */
export const drawRevealCircleFallback = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
): void => {
  if (radius <= 0) return

  // Create radial gradient from center to edge
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0, // Inner radius (center point)
    centerX,
    centerY,
    radius, // Outer radius
  )
  gradient.addColorStop(0, "rgba(0,0,0,1)") // Fully opaque at center
  gradient.addColorStop(0.6, "rgba(0,0,0,0.9)") // Still mostly opaque at 60%
  gradient.addColorStop(1, "rgba(0,0,0,0)") // Fully transparent at edge

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fill()
}
