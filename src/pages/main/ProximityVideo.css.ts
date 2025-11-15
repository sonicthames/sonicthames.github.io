import { style } from "@vanilla-extract/css"
import { tokens } from "@/theme/tokens.css"
import {
  PROXIMITY_VIDEO_TRANSITION_DURATION_MS,
  PROXIMITY_VIDEO_TRANSITION_EASING,
} from "./proximityVideoConstants"

export const proximityVideo = style({
  position: "fixed",
  display: "inline-block",
  width: "auto",
  height: "auto",
  borderRadius: 0,
  overflow: "hidden",
  backgroundColor: "transparent",
  boxShadow: tokens.shadow.card,
  transition: `transform ${PROXIMITY_VIDEO_TRANSITION_DURATION_MS}ms ${PROXIMITY_VIDEO_TRANSITION_EASING}, opacity ${PROXIMITY_VIDEO_TRANSITION_DURATION_MS}ms ${PROXIMITY_VIDEO_TRANSITION_EASING}`,
  pointerEvents: "none",
  zIndex: tokens.z.overlay,
  willChange: "transform, opacity",
  transformOrigin: "top left",
  left: 0,
  top: 0,
})

export const proximityVideoFrame = style({
  width: "100%",
  height: "100%",
  border: "none",
  display: "block",
})
