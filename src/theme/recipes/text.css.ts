import { tokens } from "@theme/tokens.css"
import { style, styleVariants } from "@vanilla-extract/css"

const baseText = style({
  color: "inherit",
  fontFamily: tokens.font.family,
})

const baseHeading = style([
  baseText,
  {
    fontFamily: tokens.font.display,
    fontWeight: tokens.font.weight.semibold,
    lineHeight: tokens.font.lineHeight.tight,
  },
])

export const heading = styleVariants({
  h1: [
    baseHeading,
    {
      fontSize: `clamp(${tokens.font.size["2xl"]}, 4vw + 14px, ${tokens.font.size["3xl"]})`,
    },
  ],
  h2: [baseHeading, { fontSize: tokens.font.size["2xl"] }],
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
