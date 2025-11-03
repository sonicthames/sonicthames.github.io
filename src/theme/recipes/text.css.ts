import { tokens } from "@theme/tokens.css"
import { style, styleVariants } from "@vanilla-extract/css"

export const baseText = style({
  color: tokens.color.text,
  margin: 0,
  fontFamily: tokens.font.family,
})

export const heading = styleVariants({
  h1: [
    baseText,
    {
      fontSize: tokens.font.size["2xl"],
      fontWeight: tokens.font.weight.bold,
      lineHeight: tokens.font.lineHeight.tight,
      letterSpacing: "-0.015em",
    },
  ],
  h2: [
    baseText,
    {
      fontSize: tokens.font.size.xl,
      fontWeight: tokens.font.weight.semibold,
      lineHeight: tokens.font.lineHeight.tight,
      letterSpacing: "-0.01em",
    },
  ],
  h3: [
    baseText,
    {
      fontSize: tokens.font.size.lg,
      fontWeight: tokens.font.weight.semibold,
      lineHeight: tokens.font.lineHeight.normal,
    },
  ],
})

export const body = styleVariants({
  default: [
    baseText,
    {
      fontSize: tokens.font.size.md,
      lineHeight: tokens.font.lineHeight.relaxed,
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
