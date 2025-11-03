import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

/**
 * Error page styles (NotFound, Crash)
 */

export const errorContainer = style({
  marginTop: tokens.space["2xl"],
})

export const errorTitle = style({
  fontSize: tokens.font.size["2xl"],
  fontWeight: tokens.font.weight.bold,
})

export const errorMessage = style({
  marginTop: tokens.space.lg,
})
