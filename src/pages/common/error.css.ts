/**
 * Shared error page styles (NotFound, Crash)
 */

import { heading } from "@theme/recipes/text.css"
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

export const errorContainer = style({
  marginTop: tokens.space["2xl"],
})

export const errorTitle = heading.h1

export const errorMessage = style({
  marginTop: tokens.space.lg,
})
