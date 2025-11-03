import { tokens } from "@theme/tokens.css"
import { style, styleVariants } from "@vanilla-extract/css"

/**
 * Contact page form styles
 */

export const contactLayout = style({
  display: "flex",
  marginTop: tokens.space["2xl"],
  gap: tokens.space.lg,
})

export const contactLayoutVariants = styleVariants({
  mobile: {
    flexDirection: "column",
  },
  portrait: {
    flexDirection: "column",
  },
  desktop: {
    flexDirection: "row",
  },
})

// Apply to direct children of contactLayout when in desktop mode
export const contactLayoutItem = style({
  selectors: {
    [`${contactLayout}.${contactLayoutVariants.desktop} > &`]: {
      flex: "1 1 50%",
    },
  },
})

export const formTitle = style({
  fontSize: tokens.font.size["2xl"],
  fontWeight: tokens.font.weight.bold,
  marginBottom: tokens.space.lg,
})

export const form = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.lg,
})

export const formLabel = style({
  display: "block",
  fontSize: tokens.font.size.sm,
  fontWeight: tokens.font.weight.medium,
  marginBottom: tokens.space.xs,
})

export const formInput = style({
  width: "100%",
  paddingLeft: tokens.space.md,
  paddingRight: tokens.space.md,
  paddingTop: tokens.space.sm,
  paddingBottom: tokens.space.sm,
  border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.md,
  background: tokens.color.bg,
  color: tokens.color.fg,
  transition: `box-shadow ${tokens.motion.fast}`,
  selectors: {
    "&:focus": {
      outline: "none",
      boxShadow: `0 0 0 2px ${tokens.color.accent}`,
    },
  },
})
