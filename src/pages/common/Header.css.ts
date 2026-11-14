/**
 * Header component styles - co-located with Header.tsx
 */
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

const narrow = "screen and (max-width: 640px)"

const topShade = `linear-gradient(180deg, ${tokens.color.contrast.dark} 0%, rgba(0, 0, 0, 0) 100%)`

export const headerRoot = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.z.header,
  color: tokens.color.contrast.light,
  fontFamily: tokens.font.display,
  fontWeight: tokens.font.weight.semibold,
  fontSize: tokens.font.size.xl,
  textTransform: "uppercase",
  pointerEvents: "none",
  backgroundImage: `${topShade}, linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0) 500px, rgba(0,0,0,0.6))`,
  "@media": {
    [narrow]: { fontSize: tokens.font.size.md },
  },
})

export const headerInner = style({
  alignItems: "baseline",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  columnGap: tokens.space.lg,
  rowGap: tokens.space.sm,
  padding: tokens.space.lg,
})

export const nav = style({
  display: "flex",
  flexWrap: "wrap",
  columnGap: tokens.space.lg,
  rowGap: tokens.space.xs,
  pointerEvents: "auto",
  textTransform: "uppercase",
  "@media": {
    [narrow]: {
      columnGap: tokens.space.sm,
      flex: "1 1 100%",
      justifyContent: "space-between",
    },
  },
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
    "&[aria-current='page']": {
      color: tokens.color.brand.accent,
    },
  },
})

export const pageHeader = style({
  position: "sticky",
  top: 0,
  zIndex: tokens.z.header,
  color: tokens.color.contrast.light,
  textTransform: "uppercase",
  fontFamily: tokens.font.display,
  fontWeight: tokens.font.weight.semibold,
  fontSize: tokens.font.size.xl,
  pointerEvents: "auto",
  backgroundImage: topShade,
  "@media": {
    [narrow]: { fontSize: tokens.font.size.md },
  },
})

export const brand = style({
  flex: "1 1 auto",
})
