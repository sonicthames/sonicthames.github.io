/**
 * Sound page (technical sheet) styles - co-located with Page.tsx
 * Replaces complex Tailwind grid layout with vanilla-extract
 */
import { heading } from "@theme/recipes/text.css"
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
export const soundTitle = style([heading.h1, { boxSizing: "border-box" }])

export const sheetHeading = style([
  heading.h3,
  { color: tokens.color.brand.olive, fontSize: tokens.font.size.xl },
])

// Technical sheet data list styles
export const technicalList = style({
  listStyle: "none",
  margin: 0,
  marginBottom: tokens.space.lg,
  padding: 0,
  display: "grid",
  gap: tokens.space.md,
  gridAutoFlow: "row",
  gridTemplateColumns: "minmax(0, 1fr)",
  "@media": {
    "screen and (min-width: 1024px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },
})

export const technicalListItem = style({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.xs,
})

export const technicalTerm = style({
  color: tokens.color.muted,
  fontSize: tokens.font.size.xs,
  fontWeight: tokens.font.weight.semibold,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
})

export const technicalDefinition = style({
  margin: 0,
})
