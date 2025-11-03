import { buttonRecipe } from "@theme/recipes/button.css"
import { body, heading } from "@theme/recipes/text.css"
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

export const hoverCard = style({
  display: "flex",
  flexDirection: "column",
  borderRadius: tokens.radius.lg,
  border: `1px solid ${tokens.color.border}`,
  background: tokens.color.primaryLight,
  color: tokens.color.text,
  boxShadow: tokens.shadow.md,
  overflow: "hidden",
  maxWidth: "320px",
  pointerEvents: "auto",
  cursor: "default",
})

export const hoverHeader = style({
  position: "absolute",
  inset: "0 0 auto 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: tokens.space.sm,
  zIndex: tokens.z.overlay,
})

export const closeButton = style([
  buttonRecipe({ tone: "ghost", size: "sm" }),
  {
    width: "32px",
    height: "32px",
    padding: 0,
  },
])

export const media = style({
  width: "100%",
  height: "140px",
  border: "none",
  boxSizing: "border-box",
})

export const bodyContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.sm,
  padding: tokens.space.lg,
})

export const title = style([heading.h3])

export const description = style([
  body.muted,
  {
    display: "flex",
    flexDirection: "column",
    gap: tokens.space.xs,
  },
])

export const meta = style([
  body.small,
  {
    display: "flex",
    flexDirection: "column",
    gap: tokens.space.xs,
  },
])

export const playButton = style([
  buttonRecipe({ tone: "link", size: "sm", fullWidth: true }),
  {
    justifyContent: "flex-start",
    gap: tokens.space.sm,
    padding: 0,
    height: "auto",
    textAlign: "left",
  },
])
