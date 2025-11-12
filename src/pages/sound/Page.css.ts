/**
 * Sound page (technical sheet) styles - co-located with Page.tsx
 * Replaces complex Tailwind grid layout with vanilla-extract
 */
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

export const soundHeader = style({
  marginBottom: tokens.space.lg,
})

export const soundArticle = style({
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gridTemplateRows: "auto auto",
  gap: tokens.space["2xl"],
  gridTemplateAreas: `
    "a a b b b"
    "d d c c c"
  `,
})

// Grid area styles
export const artworkArea = style({
  gridArea: "a",
})

export const descriptionArea = style({
  gridArea: "b",
})

export const technicalSheetArea = style({
  gridArea: "c",
  border: `1px solid rgb(75, 85, 99)`,
  padding: tokens.space.lg,
})

export const videoArea = style({
  gridArea: "d",
})

// Typography styles for sound page
export const soundTitle = style({
  boxSizing: "border-box",
  color: "rgb(90, 112, 6)",
  fontFamily: "Helvetica Neue, Helvetica, Roboto, Arial, sans-serif",
  fontSize: "2.25rem", // text-4xl
  fontWeight: 400, // font-normal
})

export const soundHeading2 = style({
  color: "rgb(90, 112, 6)",
})

export const soundHeading3 = style({
  color: "rgb(90, 112, 6)",
})

// Technical sheet data list styles
export const technicalList = style({
  listStyle: "none",
  margin: 0,
  marginBottom: tokens.space.lg,
  padding: 0,
  display: "grid",
  gap: tokens.space.md,
  gridAutoFlow: "row",
  gridAutoRows: "1fr",
  gridTemplateColumns: "repeat(2, 1fr)",
})

export const technicalListItem = style({
  display: "flex",
})

export const technicalTerm = style({
  fontWeight: tokens.font.weight.bold,
  marginRight: tokens.space.lg,
  flexBasis: "25%",
})

export const technicalDefinition = style({
  margin: 0,
  marginRight: tokens.space.lg,
  flexBasis: "70%",
})

// Button style for sound page
export const soundButton = style({
  display: "inline-flex",
  background: "rgb(86, 80, 23)",
  color: tokens.color.fg,
  padding: tokens.space.md,
  cursor: "pointer",
  textTransform: "uppercase",
})

// Video iframe style
export const videoIframe = style({
  width: "100%",
  border: "none",
  boxSizing: "border-box",
})
