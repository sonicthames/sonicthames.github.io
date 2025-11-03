import { createGlobalTheme } from "@vanilla-extract/css"
import { darkThemeClass } from "./darkTheme.css"
import { lightThemeClass } from "./lightTheme.css"
import { tokens } from "./tokens.css"

export const vars = tokens

const tailwindBridge = {
  "--color-bg": tokens.color.bg,
  "--color-fg": tokens.color.text,
  "--color-fg-muted": tokens.color.muted,
  "--color-fg-subtle": tokens.color.muted,
  "--color-accent": tokens.color.accent,
  "--color-border": tokens.color.border,
  "--color-primary": tokens.color.primary,
  "--color-primary-dark": tokens.color.primaryDark,
  "--color-primary-light": tokens.color.primaryLight,
  "--color-action": tokens.color.action,
  "--color-action-dark": tokens.color.actionDark,
  "--color-action-light": tokens.color.actionLight,
  "--color-surface": tokens.color.surface,
  "--color-surface-alt": tokens.color.surfaceAlt,
  "--color-overlay": tokens.color.overlay.base,
  "--color-overlay-light": tokens.color.overlay.light,
  "--color-overlay-medium": tokens.color.overlay.medium,
  "--radius-sm": tokens.radius.sm,
  "--radius-md": tokens.radius.md,
  "--radius-lg": tokens.radius.lg,
  "--radius-xl": tokens.radius.xl,
  "--shadow-card": tokens.shadow.card,
  "--spacing-page": tokens.space.lg,
}

createGlobalTheme(`.${lightThemeClass}`, tailwindBridge)
createGlobalTheme(`.${darkThemeClass}`, tailwindBridge)
