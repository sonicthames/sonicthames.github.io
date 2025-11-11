import { tokens } from "@theme/tokens.css"
import { style, styleVariants } from "@vanilla-extract/css"

export const contactLayout = style({
  marginTop: tokens.space["2xl"],
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

export const contactLayoutItem = style({
  selectors: {
    [`${contactLayout}.${contactLayoutVariants.desktop} > &`]: {
      flex: "1 1 50%",
    },
  },
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
  color: tokens.color.text,
})

export const formInput = style({
  width: "100%",
  padding: tokens.space.md,
  border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.md,
  background: tokens.color.bg,
  color: tokens.color.text,
  fontSize: tokens.font.size.md,
  fontFamily: tokens.font.family,
  transition: `box-shadow ${tokens.motion.fast}`,
  selectors: {
    "&:focus": {
      outline: "none",
      boxShadow: `0 0 0 2px ${tokens.color.accent}`,
    },
  },
})
