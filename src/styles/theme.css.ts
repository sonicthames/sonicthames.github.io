import {
  createGlobalTheme,
  createTheme,
  createThemeContract,
} from "@vanilla-extract/css"

// Theme contract - defines the shape of our theme variables
export const vars = createThemeContract({
  color: {
    bg: null,
    fg: null,
    accent: null,
    border: null,
    primary: null,
    primaryDark: null,
    primaryLight: null,
    action: null,
    actionDark: null,
    actionLight: null,
  },
  radius: {
    sm: null,
    md: null,
    lg: null,
    xl: null,
  },
  shadow: {
    card: null,
  },
  spacing: {
    page: null,
  },
})

// Light theme
export const lightTheme = createTheme(vars, {
  color: {
    bg: "250 242 244", // #faf2f4
    fg: "40 18 32", // #281220
    accent: "33 150 243", // #2196f3
    border: "199 201 205", // #c7c9cd
    primary: "56 46 50", // #382e32
    primaryDark: "40 18 32", // #281220
    primaryLight: "250 242 244", // #faf2f4
    action: "33 150 243", // #2196f3
    actionDark: "13 71 161", // #0d47a1
    actionLight: "144 202 249", // #90caf9
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "12px",
    xl: "16px",
  },
  shadow: {
    card: "0 4px 16px rgba(0,0,0,0.08)",
  },
  spacing: {
    page: "16px",
  },
})

// Dark theme
export const darkTheme = createTheme(vars, {
  color: {
    bg: "17 24 39", // #111827
    fg: "229 231 235", // #e5e7eb
    accent: "129 140 248", // #818cf8
    border: "55 65 81", // #374151
    primary: "31 41 55", // #1f2937
    primaryDark: "17 24 39", // #111827
    primaryLight: "55 65 81", // #374151
    action: "129 140 248", // #818cf8
    actionDark: "79 70 229", // #4f46e5
    actionLight: "165 180 252", // #a5b4fc
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "12px",
    xl: "16px",
  },
  shadow: {
    card: "0 8px 24px rgba(0,0,0,0.35)",
  },
  spacing: {
    page: "16px",
  },
})

// Global CSS variables for Tailwind
createGlobalTheme(":root", {
  "color-bg": vars.color.bg,
  "color-fg": vars.color.fg,
  "color-accent": vars.color.accent,
  "color-border": vars.color.border,
  "color-primary": vars.color.primary,
  "color-primary-dark": vars.color.primaryDark,
  "color-primary-light": vars.color.primaryLight,
  "color-action": vars.color.action,
  "color-action-dark": vars.color.actionDark,
  "color-action-light": vars.color.actionLight,
  "radius-sm": vars.radius.sm,
  "radius-md": vars.radius.md,
  "radius-lg": vars.radius.lg,
  "radius-xl": vars.radius.xl,
  "shadow-card": vars.shadow.card,
  "spacing-page": vars.spacing.page,
})
