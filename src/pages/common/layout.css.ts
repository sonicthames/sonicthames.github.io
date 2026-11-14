/**
 * Shared page and app layout styles
 * Replaces Tailwind classes from pages/styles.ts
 */
import { tokens } from "@theme/tokens.css"
import { style, styleVariants } from "@vanilla-extract/css"
import { mapColorTheme } from "@/theme/mapColors"

export const pageRoot = style({
  color: tokens.color.contrast.light,
  display: "flex",
  flex: "1 1 0%",
  flexDirection: "column",
  overflowY: "auto",
  position: "relative",
})

export const pageMain = style({
  flex: "1 1 0%",
})

export const contentContainer = style({
  paddingBottom: tokens.space["2xl"],
})

const mobilePadding = {
  paddingLeft: tokens.space.lg,
  paddingRight: tokens.space.lg,
}

export const pageMainVariants = styleVariants({
  mobile: mobilePadding,
  portrait: mobilePadding,
  desktop: {
    ...mobilePadding,
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
  },
})

/**
 * App-level layout styles
 */
export const appContainer = style({
  background: mapColorTheme.streetSurfaceColor,
  display: "flex",
  flexDirection: "column",
  position: "relative",
  // On mobile, 100vh includes the space under the browser toolbars.
  height: "100dvh",
  width: "100vw",
  overflow: "hidden",
})

export const appMapLayer = style({
  position: "absolute",
  inset: 0,
})

export const appHeaderLayer = style({
  position: "absolute",
  inset: "0 0 auto 0",
  zIndex: tokens.z.header,
})

export const mapUnavailable = style({
  alignItems: "center",
  color: tokens.color.text,
  display: "flex",
  height: "100%",
  justifyContent: "center",
  margin: 0,
  padding: tokens.space.lg,
  textAlign: "center",
})

export const visuallyHidden = style({
  border: 0,
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  whiteSpace: "nowrap",
  width: "1px",
})
