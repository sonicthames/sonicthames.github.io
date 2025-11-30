/**
 * Unified ripple animation system for sound markers and fog overlays.
 *
 * Provides consistent ripple effects across PIXI.js and Canvas 2D contexts.
 */

import { Graphics } from "pixi.js"
import { computeZoomProgress } from "./zoomScale"

/**
 * Configuration for ripple animation behavior.
 */
export interface RippleConfig {
  /** Number of ripples per marker/point */
  readonly count: number
  /** Maximum age in seconds before ripple resets */
  readonly maxAge: number
  /** Delay between ripples in seconds */
  readonly delay: number
  /** Minimum scale multiplier at min zoom */
  readonly minScale: number
  /** Maximum scale multiplier at max zoom */
  readonly maxScale: number
  /** Base radius before scaling */
  readonly baseRadius: number
  /** Range multiplier for animation (ripple grows from base to base * range) */
  readonly animationRange: number
}

/**
 * Individual ripple state for PIXI.js rendering.
 */
export interface PixiRipple {
  graphics: Graphics
  age: number
  maxAge: number
}

/**
 * Creates initial ripples for PIXI.js with staggered timing.
 */
export const createPixiRipples = (
  config: RippleConfig,
  initialOffset: number = 0,
): PixiRipple[] => {
  const ripples: PixiRipple[] = []

  for (let i = 0; i < config.count; i++) {
    const graphics = new Graphics()
    ripples.push({
      graphics,
      age: i * config.delay + initialOffset,
      maxAge: config.maxAge,
    })
  }

  return ripples
}

/**
 * Updates and draws a PIXI ripple.
 * Returns true if ripple was drawn, false if expired and reset.
 */
export const updatePixiRipple = (
  ripple: PixiRipple,
  deltaTime: number,
  x: number,
  y: number,
  currentZoom: number,
  config: RippleConfig,
  color: number | string,
): boolean => {
  ripple.graphics.clear()
  ripple.age += deltaTime

  if (ripple.age >= ripple.maxAge) {
    ripple.age = 0
  }

  const progress = ripple.age / ripple.maxAge
  const zoomProgress = computeZoomProgress(currentZoom)
  const zoomScale =
    config.minScale + zoomProgress * (config.maxScale - config.minScale)

  const easedProgress = 1 - (1 - progress) ** 2
  const expansion = 1 + easedProgress * config.animationRange
  const radius = config.baseRadius * expansion * zoomScale
  const alpha = Math.max(0, 1 - progress ** 0.5) * 0.6

  ripple.graphics.circle(x, y, radius)
  ripple.graphics.stroke({
    width: 2,
    color,
    alpha,
  })

  return true
}

/**
 * Draws a Canvas 2D ripple at current animation state.
 */
export const drawCanvasRipple = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  rippleIndex: number,
  cycleDuration: number,
  currentZoom: number,
  config: RippleConfig,
  color: string = "rgba(255, 255, 255, {alpha})",
): void => {
  const phaseOffset = rippleIndex * 0.5
  const progress = (time / cycleDuration + phaseOffset) % 1.0

  const zoomProgress = computeZoomProgress(currentZoom)
  const zoomScale =
    config.minScale + zoomProgress * (config.maxScale - config.minScale)

  const easedProgress = 1 - (1 - progress) ** 2
  const expansion = 1 + easedProgress * config.animationRange
  const radius = config.baseRadius * expansion * zoomScale
  const opacity = (1 - progress) * 0.5

  if (opacity > 0.05) {
    ctx.strokeStyle = color.replace("{alpha}", opacity.toString())
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.stroke()
  }
}

/**
 * Default ripple configuration for sound markers (PIXI.js).
 */
export const SOUND_MARKER_RIPPLE_CONFIG: RippleConfig = {
  count: 2,
  maxAge: 3.0,
  delay: 1.0,
  minScale: 0.8,
  maxScale: 1.6,
  baseRadius: 8, // Will be multiplied by scaled marker radius
  animationRange: 3,
}

/**
 * Default ripple configuration for fog overlay (Canvas 2D).
 */
export const FOG_RIPPLE_CONFIG: RippleConfig = {
  count: 2,
  maxAge: 8.0, // 8-second cycle (4x slower than base 2s)
  delay: 0.5,
  minScale: 1,
  maxScale: 4,
  baseRadius: 20,
  animationRange: 1, // Grows from 0 to baseRadius
}
