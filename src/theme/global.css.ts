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

globalStyle("body", {
  margin: 0,
  background: tokens.color.bg,
  color: tokens.color.text,
  fontFamily: tokens.font.family,
  lineHeight: tokens.font.lineHeight.normal,
  MozOsxFontSmoothing: "grayscale",
  WebkitFontSmoothing: "antialiased",
})
