import type { Category } from "@/domain/sound"

type SoundColorMap = Record<Category, string>

export const soundBaseColors = {
  Listen: "#F7C0D6",
  See: "#D9FFE8",
  Feel: "#E3D8FF",
} as const satisfies SoundColorMap

export const soundHoverColors = {
  Listen: "#FF76A6",
  See: "#65F4B4",
  Feel: "#8C6AFF",
} as const satisfies SoundColorMap

export const soundGlowColors = {
  Listen: "#FFA8C8",
  See: "#9CF6D3",
  Feel: "#B7A1FF",
} as const satisfies SoundColorMap

export const defaultMapColorTheme = {
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
} as const

export const mapColorTheme = defaultMapColorTheme
