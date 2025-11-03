import { createThemeContract } from "@vanilla-extract/css"

/**
 * Theme contract matching original Tailwind structure.
 * RGB colors use space-separated format for easy alpha composition.
 */
export const tokens = createThemeContract({
  color: {
    // Base space-separated RGB values (for alpha composition)
    bgRgb: null,
    fgRgb: null,
    accentRgb: null,
    borderRgb: null,
    primaryRgb: null,
    primaryDarkRgb: null,
    primaryLightRgb: null,
    actionRgb: null,
    actionDarkRgb: null,
    actionLightRgb: null,

    // Computed colors (used in styles)
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

    // Semantic aliases for new components
    text: null,
    muted: null,
    surface: null,
    surfaceAlt: null,

    // Hover states (matching Tailwind utilities)
    hover: {
      light: null,
      focus: null,
    },

    // Overlays (using primaryDark as base)
    overlay: {
      base: null,
      light: null,
      medium: null,
    },

    // Brand colors (for new components)
    brand: {
      primary: null,
      accent: null,
      warning: null,
      success: null,
      danger: null,
    },

    glow: {
      violet: null,
      cyan: null,
    },
  },
  radius: {
    sm: null,
    md: null,
    lg: null,
    xl: null,
    pill: null,
  },
  space: {
    xs: null,
    sm: null,
    md: null,
    lg: null,
    xl: null,
    "2xl": null,
  },
  shadow: {
    card: null, // Original Tailwind shadow-card
    sm: null,
    md: null, // Tailwind shadow-md (subtle)
    lg: null,
    drawer: null, // Specific drawer shadow
    sidePanel: null, // Specific side panel shadow
    glowSoft: null,
    glowHard: null,
  },
  z: {
    base: null,
    header: null,
    overlay: null,
  },
  motion: {
    fast: null,
    normal: null,
    slow: null,
  },
  font: {
    family: null,
    size: {
      xs: null,
      sm: null,
      md: null,
      lg: null,
      xl: null,
      "2xl": null,
    },
    weight: {
      regular: null,
      medium: null,
      semibold: null,
      bold: null,
    },
    lineHeight: {
      tight: null,
      normal: null,
      relaxed: null,
    },
  },
})
