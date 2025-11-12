/**
 * Header component styles - co-located with Header.tsx
 */
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

export const headerRoot = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.z.header,
  color: "#fff",
  fontWeight: tokens.font.weight.bold,
  fontSize: tokens.font.size.xl,
  textTransform: "uppercase",
  pointerEvents: "none",
  backgroundImage:
    "linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0) 500px, rgba(0,0,0,0.6))",
})

export const headerInner = style({
  display: "flex",
  justifyContent: "flex-end",
  gap: tokens.space.lg,
  padding: tokens.space.lg,
})

export const nav = style({
  display: "flex",
  gap: tokens.space.lg,
  pointerEvents: "auto",
  textTransform: "uppercase",
})

export const navLink = style({
  color: "inherit",
  textDecoration: "none",
  transition: `opacity ${tokens.motion.fast}`,
  selectors: {
    "&:visited": {
      color: "inherit",
    },
    "&:hover": {
      opacity: 0.8,
    },
  },
})

export const pageHeader = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.z.header,
  background: tokens.color.primaryDark,
  color: "#fff",
  textTransform: "uppercase",
  fontWeight: tokens.font.weight.bold,
  fontSize: tokens.font.size.xl,
  pointerEvents: "auto",
})

export const brand = style({
  flex: "1 1 auto",
})
