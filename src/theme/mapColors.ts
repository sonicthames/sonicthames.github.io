import type { Category } from "@/domain/sound"

type SoundColorMap = Record<Category, string>

export interface MapColorTheme {
  readonly soundBaseColors: SoundColorMap
  readonly soundHoverColors: SoundColorMap
  readonly soundGlowColors: SoundColorMap
  readonly hoverTransitionMs: number
  readonly soundGlowRadius: number
  readonly soundGlowOpacity: number
  readonly userAvatarColor: string
  readonly userAvatarPulseColor: string
  readonly userAvatarPulseOpacity: number
  readonly userAvatarPulseRadiusMultiplier: number
  readonly userAvatarPulseDurationMs: number
  readonly riverColor: string
  readonly streetSurfaceColor: string
  readonly streetLineColor: string
  readonly peripheralRingColor: string
  readonly peripheralRingOpacityScale: number
  readonly peripheralRingStrokeWidth: number
}

const SOUND_CATEGORIES: readonly Category[] = ["Listen", "See", "Feel"]

const createSoundMap = (values: readonly string[]): SoundColorMap =>
  SOUND_CATEGORIES.reduce((acc, category, index) => {
    acc[category] = values[index]
    return acc
  }, {} as SoundColorMap)

const soundBaseColors = createSoundMap([
  "#F7C0D6", // Listen – pastel rose (slightly deeper)
  "#D9FFE8", // See – pastel mint
  "#E3D8FF", // Feel – pastel lavender
])

const soundHoverColors = createSoundMap([
  "#FF76A6", // Listen
  "#65F4B4", // See
  "#8C6AFF", // Feel
])

const soundGlowColors = createSoundMap(["#FFA8C8", "#9CF6D3", "#B7A1FF"])

export const defaultMapColorTheme: MapColorTheme = {
  soundBaseColors,
  soundHoverColors,
  soundGlowColors,
  hoverTransitionMs: 200,
  soundGlowRadius: 5,
  soundGlowOpacity: 0.34,
  userAvatarColor: "#F45BFF",
  userAvatarPulseColor: "#FFB8FF",
  userAvatarPulseOpacity: 0.26,
  userAvatarPulseRadiusMultiplier: 1.3,
  userAvatarPulseDurationMs: 3200,
  riverColor: "#1FC7DD",
  streetSurfaceColor: "#090E15",
  streetLineColor: "#212734",
  peripheralRingColor: "#A8B0C2",
  peripheralRingOpacityScale: 0.65,
  peripheralRingStrokeWidth: 2,
}

export const mapColorTheme = defaultMapColorTheme

export const soundBaseColorsTokens = defaultMapColorTheme.soundBaseColors
export const soundHoverColorsTokens = defaultMapColorTheme.soundHoverColors
export const soundGlowColorsTokens = defaultMapColorTheme.soundGlowColors
