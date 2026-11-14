import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

export const frame = style({
  aspectRatio: "16 / 9",
  background: tokens.color.contrast.dark,
  border: "none",
  boxSizing: "border-box",
  display: "block",
  width: "100%",
})

export const poster = style([
  frame,
  {
    cursor: "pointer",
    overflow: "hidden",
    padding: 0,
    position: "relative",
    selectors: {
      // Clips any drawing outside the frame.
      "&:focus-visible": { outlineOffset: "-3px" },
    },
  },
])

export const posterImage = style({
  display: "block",
  height: "100%",
  objectFit: "cover",
  transition: `opacity ${tokens.motion.fast}`,
  width: "100%",
  selectors: {
    [`${poster}:hover &`]: { opacity: 0.85 },
  },
})

export const playBadge = style({
  height: "64px",
  left: "50%",
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "64px",
})

export const playBackdrop = style({ fill: "rgb(0 0 0 / 0.6)" })

export const playRing = style({
  fill: "none",
  stroke: tokens.color.brand.accent,
  strokeWidth: 2,
})

export const playIcon = style({ fill: tokens.color.brand.accent })
