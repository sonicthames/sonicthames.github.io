import { style } from "@vanilla-extract/css"

export const canvasContainer = style({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
})

export const pixiCanvas = style({
  position: "absolute",
  top: 0,
  left: 0,
  cursor: "pointer",
  zIndex: 1,
})
