/**
 * Sounds page styles - co-located with Page.tsx
 */
import { heading, text } from "@theme/recipes/text.css"
import { tokens } from "@theme/tokens.css"
import { globalStyle, style } from "@vanilla-extract/css"

export const grid = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "grid",
  gap: tokens.space["2xl"],
  gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
  "@media": {
    "screen and (min-width: 640px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "screen and (min-width: 1024px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  boxSizing: "border-box",
})

export const card = style({
  height: "100%",
  background: tokens.color.surface,
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  color: tokens.color.text,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
})

export const media = style({
  display: "flex",
  overflow: "hidden",
  background: "#000",
})

export const cardBody = style({
  padding: tokens.space.md,
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  gap: tokens.space.sm,
  position: "relative",
})

export const cardTitle = style([
  heading.h3,
  { fontSize: tokens.font.size.xl, margin: 0 },
])

export const cardDescription = style([
  text.body,
  {
    fontStyle: "italic",
    color: tokens.color.text,
  },
])

export const cardLink = style({
  color: tokens.color.text,
  textDecoration: "none",
  "::after": {
    content: '""',
    inset: 0,
    position: "absolute",
  },
  selectors: {
    [`${cardBody}:hover &`]: {
      textDecoration: "underline",
    },
  },
})

globalStyle(`${cardDescription} p`, { margin: 0 })
