import { tokens } from "@theme/tokens.css"
import { style, styleVariants } from "@vanilla-extract/css"

const baseText = style({
  color: tokens.color.text,
  margin: 0,
  fontFamily: tokens.font.family,
})

const baseHeading = style([
  baseText,
  {
    fontWeight: tokens.font.weight.semibold,
    lineHeight: tokens.font.lineHeight.tight,
  },
])

export const heading = styleVariants({
  h1: [baseHeading, { fontSize: tokens.font.size["2xl"] }],
  h2: [baseHeading, { fontSize: tokens.font.size.xl }],
  h3: [baseHeading, { fontSize: tokens.font.size.lg }],
})

export const text = styleVariants({
  body: [
    baseText,
    {
      fontSize: tokens.font.size.md,
      lineHeight: tokens.font.lineHeight.normal,
    },
  ],
  muted: [
    baseText,
    {
      fontSize: tokens.font.size.md,
      color: tokens.color.muted,
    },
  ],
  small: [
    baseText,
    {
      fontSize: tokens.font.size.sm,
      lineHeight: tokens.font.lineHeight.normal,
    },
  ],
})
