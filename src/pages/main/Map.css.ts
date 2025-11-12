/**
 * Map component styles - co-located with Map.tsx
 */
import { tokens } from "@theme/tokens.css"
import { style, styleVariants } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const sidebar = recipe({
  base: {
    position: "fixed",
    inset: "0 auto 0 0",
    width: "500px",
    padding: tokens.space.lg,
    overflowY: "auto",
    background: tokens.color.surfaceAlt,
    boxShadow: "2px 0 24px rgba(0,0,0,0.2)",
    transition: "transform 150ms ease-in-out",
    zIndex: tokens.z.overlay,
    cursor: "default",
    pointerEvents: "auto",
    transform: "translateX(-100%)",
  },
  variants: {
    expanded: {
      true: {
        transform: "translateX(0)",
      },
      false: {
        transform: "translateX(-100%)",
      },
    },
  },
  defaultVariants: {
    expanded: true,
  },
})

export const sidebarHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space.lg,
  marginBottom: tokens.space.lg,
})

export const filtersGroup = style({
  display: "flex",
  gap: tokens.space.xs,
  border: "none",
  margin: 0,
  padding: 0,
})

const filterButtonBase = {
  border: "none",
  background: "transparent",
  borderRadius: tokens.radius.sm,
  padding: tokens.space.sm,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 0,
  transition: "background-color 150ms ease-in-out, color 150ms ease-in-out",
} as const

export const filterButton = styleVariants({
  inactive: [
    filterButtonBase,
    {
      color: tokens.color.primary,
      selectors: {
        "&:hover": {
          background: `rgba(${tokens.color.primaryRgb}, 0.1)`,
        },
      },
    },
  ],
  active: [
    filterButtonBase,
    {
      background: tokens.color.action,
      color: "#fff",
    },
  ],
})

export const closeButton = style({
  border: "none",
  background: "transparent",
  color: tokens.color.primary,
  borderRadius: tokens.radius.sm,
  padding: tokens.space.sm,
  transition: "background-color 150ms ease-in-out",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      background: `rgba(${tokens.color.primaryRgb}, 0.1)`,
    },
  },
})

export const youtubeLink = style({
  textDecoration: "none",
  border: `1px solid ${tokens.color.primary}`,
  color: tokens.color.primary,
  padding: `${tokens.space.xs} ${tokens.space.md}`,
  borderRadius: tokens.radius.sm,
  transition: "background-color 150ms ease-in-out, color 150ms ease-in-out",
  selectors: {
    "&:hover": {
      background: `rgba(${tokens.color.primaryRgb}, 0.05)`,
    },
  },
})

export const hoverFloating = style({
  position: "fixed",
  inset: "auto 25px 60px auto",
  width: "300px",
  zIndex: tokens.z.overlay,
})

export const selectedSound = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.lg,
  marginBottom: tokens.space.lg,
})

export const videoFrame = style({
  width: "100%",
  border: "none",
  boxSizing: "border-box",
})

export const srOnly = style({
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  width: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
})

export const logoPosition = style({
  position: "absolute",
  inset: "auto -40px -85px auto",
  width: "20rem",
  pointerEvents: "none",
  zIndex: tokens.z.overlay,
})

export const restoreFogButton = style({
  position: "absolute",
  bottom: "20px",
  left: "20px",
  padding: "8px 16px",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: "white",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  fontFamily: "monospace",
  zIndex: 1000,
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
    },
  },
})
