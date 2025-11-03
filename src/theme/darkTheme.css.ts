import { createTheme } from "@vanilla-extract/css"
import { rgba } from "./helpers"
import { tokens } from "./tokens.css"

/**
 * Dark theme with consistent structure to light theme.
 */
export const darkThemeClass = createTheme(tokens, {
  color: {
    // Base RGB values (space-separated for alpha composition)
    bgRgb: "17 24 39",
    fgRgb: "229 231 235",
    accentRgb: "129 140 248",
    borderRgb: "55 65 81",
    primaryRgb: "31 41 55",
    primaryDarkRgb: "17 24 39",
    primaryLightRgb: "55 65 81",
    actionRgb: "129 140 248",
    actionDarkRgb: "79 70 229",
    actionLightRgb: "165 180 252",

    // Computed solid colors
    bg: rgba("17 24 39"),
    fg: rgba("229 231 235"),
    accent: rgba("129 140 248"),
    border: rgba("55 65 81"),
    primary: rgba("31 41 55"),
    primaryDark: rgba("17 24 39"),
    primaryLight: rgba("55 65 81"),
    action: rgba("129 140 248"),
    actionDark: rgba("79 70 229"),
    actionLight: rgba("165 180 252"),

    // Semantic aliases
    text: rgba("229 231 235"),
    muted: rgba("142 146 163"),
    surface: rgba("12 10 20", 0.95),
    surfaceAlt: rgba("18 15 28", 0.97),

    // Hover states (adjusted for dark theme)
    hover: {
      light: "rgba(55, 65, 81, 0.5)", // Lighter overlay for dark theme
      focus: "rgba(255, 255, 255, 0.1)", // White @ 10% for dark theme
    },

    // Overlays
    overlay: {
      base: rgba("12 10 20", 0.7),
      light: rgba("12 10 20", 0.5),
      medium: rgba("12 10 20", 0.85),
    },

    // Brand colors
    brand: {
      primary: rgba("167 139 250"),
      accent: rgba("103 232 249"),
      warning: "#fbbf24",
      success: "#34d399",
      danger: "#f87171",
    },

    glow: {
      violet: "rgba(167, 139, 250, 0.8)",
      cyan: "rgba(103, 232, 249, 0.8)",
    },
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "12px",
    xl: "16px",
    pill: "999px",
  },
  space: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
  },
  shadow: {
    card: "0 4px 16px rgba(0, 0, 0, 0.3)",
    sm: "0 1px 2px rgba(0, 0, 0, 0.2)",
    md: "0 4px 6px rgba(0, 0, 0, 0.2)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.3)",
    drawer: "0 12px 48px rgba(0, 0, 0, 0.6)",
    sidePanel: "0 0 32px rgba(0, 0, 0, 0.5)",
    glowSoft: "0 0 24px rgba(167, 139, 250, 0.55)",
    glowHard: "0 0 64px rgba(103, 232, 249, 0.65)",
  },
  z: {
    base: "0",
    header: "1",
    overlay: "2",
  },
  motion: {
    fast: "120ms",
    normal: "200ms",
    slow: "360ms",
  },
  font: {
    family:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    size: {
      xs: "12px",
      sm: "13px",
      md: "14px",
      lg: "16px",
      xl: "18px",
      "2xl": "22px",
    },
    weight: { regular: "400", medium: "500", semibold: "600", bold: "700" },
    lineHeight: { tight: "1.2", normal: "1.45", relaxed: "1.6" },
  },
})
