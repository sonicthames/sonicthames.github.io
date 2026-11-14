/**
 * Contact page styles - co-located with Page.tsx
 */
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

export const contactLayout = style({
  marginTop: tokens.space["2xl"],
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.xl,
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
  color: tokens.color.contrast.light,
})

export const formInput = style({
  background: tokens.color.bg,
  border: `1px solid ${tokens.color.border}`,
  color: tokens.color.text,
  fontSize: tokens.font.size.md,
  padding: tokens.space.md,
  width: "100%",
})
