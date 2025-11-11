import { tokens } from "@theme/tokens.css"
import { style, styleVariants } from "@vanilla-extract/css"

/**
 * Base page layout styles
 * Replaces Tailwind classes from pages/styles.ts
 */

export const pageRoot = style({
  display: "flex",
  flex: "1 1 0%",
  flexDirection: "column",
  position: "relative",
  background: tokens.color.bg,
  color: tokens.color.fg,
  overflowY: "auto",
})

export const pageMain = style({
  flex: "1 1 0%",
})

const mobilePadding = {
  paddingLeft: tokens.space.lg,
  paddingRight: tokens.space.lg,
}

export const pageMainVariants = styleVariants({
  mobile: mobilePadding,
  portrait: mobilePadding,
  desktop: {
    ...mobilePadding,
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
  },
})

/**
 * Common content container styles
 */
export const contentContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.lg,
})

export const textAction = style({
  color: tokens.color.action,
  transition: `opacity ${tokens.motion.fast}`,
  selectors: {
    "&:hover": {
      opacity: 0.8,
    },
  },
})

/**
 * App-level layout styles
 */
export const appContainer = style({
  position: "relative",
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
})

export const appMapLayer = style({
  position: "absolute",
  inset: 0,
})

export const appHeaderLayer = style({
  position: "absolute",
  inset: "0 0 auto 0",
  zIndex: tokens.z.header,
})
