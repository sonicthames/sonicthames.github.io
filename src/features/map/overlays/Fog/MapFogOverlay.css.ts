import { style } from "@vanilla-extract/css"

export const fogOverlayContainer = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none", // Allow clicks to pass through to map/markers
  zIndex: 1, // Above map, below UI overlays
})

export const fogCanvas = style({
  display: "block",
  width: "100%",
  height: "100%",
})
