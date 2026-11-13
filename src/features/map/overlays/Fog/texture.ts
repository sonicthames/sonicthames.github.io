/**
 * Pre-rendered reveal gradient. The gradient is scale-invariant, so a single
 * texture drawn at each reveal's size replaces a cache keyed by radius.
 */
const TEXTURE_RADIUS = 256

let texture: OffscreenCanvas | null = null

/**
 * Radial gradient matching the original drawRevealCircle implementation:
 * fully opaque at the centre, still mostly opaque at 60%, transparent at the
 * edge.
 */
const createRevealTexture = (radius: number): OffscreenCanvas => {
  const canvas = new OffscreenCanvas(radius * 2, radius * 2)
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error(
      "[FogTexture] Failed to get 2d context from OffscreenCanvas",
    )
  }

  const gradient = ctx.createRadialGradient(
    radius,
    radius,
    0,
    radius,
    radius,
    radius,
  )
  gradient.addColorStop(0, "rgba(0,0,0,1)")
  gradient.addColorStop(0.6, "rgba(0,0,0,0.9)")
  gradient.addColorStop(1, "rgba(0,0,0,0)")

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(radius, radius, radius, 0, Math.PI * 2)
  ctx.fill()

  return canvas
}

export const getRevealTexture = (): OffscreenCanvas => {
  texture ??= createRevealTexture(TEXTURE_RADIUS)
  return texture
}
