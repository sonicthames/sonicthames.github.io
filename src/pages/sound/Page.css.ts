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
  gap: tokens.space["2xl"],
  gridTemplateColumns: "minmax(0, 1fr)",
  gridTemplateAreas: `"media" "description" "sheet"`,
  "@media": {
    "screen and (min-width: 768px)": {
      alignItems: "start",
      gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
      gridTemplateAreas: `"media description" "media sheet"`,
    },
  },
})

export const mediaArea = style({
  gridArea: "media",
  display: "grid",
  gap: tokens.space.lg,
})

export const artworkImage = style({
  width: "100%",
  maxWidth: "400px",
  height: "auto",
})

export const descriptionArea = style({
  gridArea: "description",
})

export const technicalSheetArea = style({
  gridArea: "sheet",
  border: `1px solid rgb(75, 85, 99)`,
  padding: tokens.space.lg,
})

// Typography styles for sound page
export const soundTitle = style({
  boxSizing: "border-box",
  color: tokens.color.brand.olive,
  fontFamily: "Helvetica Neue, Helvetica, Roboto, Arial, sans-serif",
  fontSize: "2.25rem", // text-4xl
  fontWeight: 400, // font-normal
})

export const soundHeading3 = style({
  color: tokens.color.brand.olive,
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
  gridTemplateColumns: "minmax(0, 1fr)",
  "@media": {
    "screen and (min-width: 1024px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
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

// Video iframe style
export const videoIframe = style({
  width: "100%",
  height: "auto",
  aspectRatio: "16 / 9",
  border: "none",
  boxSizing: "border-box",
})
