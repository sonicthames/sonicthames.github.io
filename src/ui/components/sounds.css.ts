import { body, heading } from "@theme/recipes/text.css"
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

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
  background: tokens.color.primaryLight, // FIXED: solid background, no transparency
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)", // FIXED: exact original shadow
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

export const iframe = style({
  width: "100%",
  border: "none",
  boxSizing: "border-box",
})

export const cardBody = style({
  padding: tokens.space.md,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.sm,
})

export const cardTitle = style([
  heading.h3,
  {
    fontSize: tokens.font.size.xl,
    fontWeight: tokens.font.weight.bold,
  },
])

export const cardDescription = style([
  body.default,
  {
    fontStyle: "italic",
    color: tokens.color.primary,
  },
])

export const cardLink = style({
  color: tokens.color.text,
  textDecoration: "none",
  selectors: {
    "&:hover": {
      textDecoration: "underline",
    },
  },
})
