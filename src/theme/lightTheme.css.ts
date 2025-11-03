import { createTheme } from "@vanilla-extract/css"
import { rgba } from "./helpers"
import { tokens } from "./tokens.css"

/**
 * Light theme with exact Tailwind parity.
 * All RGB values match original theme.css.ts from commit 44acc5a.
 */
export const lightThemeClass = createTheme(tokens, {
  color: {
    // Base RGB values (space-separated for alpha composition)
    bgRgb: "250 242 244",
    fgRgb: "40 18 32",
    accentRgb: "33 150 243",
    borderRgb: "199 201 205",
    primaryRgb: "56 46 50",
    primaryDarkRgb: "40 18 32",
    primaryLightRgb: "250 242 244",
    actionRgb: "33 150 243",
    actionDarkRgb: "13 71 161",
    actionLightRgb: "144 202 249",

    // Computed solid colors
    bg: rgba("250 242 244"),
    fg: rgba("40 18 32"),
    accent: rgba("33 150 243"),
    border: rgba("199 201 205"),
    primary: rgba("56 46 50"),
    primaryDark: rgba("40 18 32"),
    primaryLight: rgba("250 242 244"),
    action: rgba("33 150 243"),
    actionDark: rgba("13 71 161"),
    actionLight: rgba("144 202 249"),

    // Semantic aliases
    text: rgba("40 18 32"),
    muted: rgba("107 95 100"), // Slightly muted fg
    surface: rgba("250 242 244", 0.98),
    surfaceAlt: rgba("250 242 244", 0.96),

    // Hover states (Tailwind equivalents)
    hover: {
      light: "rgba(243, 244, 246, 1)",
      focus: "rgba(0, 0, 0, 0.08)",
    },

    // Overlays (primaryDark with alpha)
    overlay: {
      base: rgba("40 18 32", 0.7),
      light: rgba("40 18 32", 0.3),
      medium: rgba("40 18 32", 0.45),
    },

    // Brand colors
    brand: {
      primary: rgba("56 46 50"),
      accent: rgba("33 150 243"),
      warning: "#f59e0b",
      success: "#10b981",
      danger: "#ef4444",
    },

    glow: {
      violet: "rgba(139, 92, 246, 0.75)",
      cyan: "rgba(34, 211, 238, 0.75)",
    },
  },
  // CRITICAL: Match original Tailwind values exactly
  radius: {
    sm: "6px",
    md: "10px",
    lg: "12px", // FIXED: was 14px
    xl: "16px", // FIXED: was 20px
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
    card: "0 4px 16px rgba(0, 0, 0, 0.08)", // Original Tailwind shadow-card
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)", // FIXED: Tailwind shadow-md (subtle)
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    drawer: "0 12px 48px rgba(0, 0, 0, 0.35)", // Specific drawer shadow
    sidePanel: "0 0 32px rgba(0, 0, 0, 0.25)", // Specific side panel shadow
    glowSoft: "0 0 24px rgba(139, 92, 246, 0.45)",
    glowHard: "0 0 64px rgba(34, 211, 238, 0.55)",
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
