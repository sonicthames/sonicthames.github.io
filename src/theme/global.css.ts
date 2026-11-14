import { tokens } from "@theme/tokens.css"
import { globalStyle } from "@vanilla-extract/css"

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
})

globalStyle("html, body, #root", {
  height: "100%",
})

globalStyle("button, input, select, textarea", {
  fontFamily: "inherit",
})

globalStyle(":focus-visible", {
  outline: `2px solid ${tokens.color.brand.accent}`,
  outlineOffset: "3px",
})

globalStyle("body", {
  margin: 0,
  background: tokens.color.bg,
  color: tokens.color.text,
  fontFamily: tokens.font.family,
  lineHeight: tokens.font.lineHeight.normal,
  MozOsxFontSmoothing: "grayscale",
  WebkitFontSmoothing: "antialiased",
})
