import { style } from "@vanilla-extract/css"
import { mobilePageWidth } from "@/theme/media"
import { tokens } from "@/theme/tokens.css"
import {
  PROXIMITY_VIDEO_TRANSITION_DURATION_MS,
  PROXIMITY_VIDEO_TRANSITION_EASING,
} from "./proximityVideoConstants"

export const proximityVideo = style({
  alignItems: "stretch",
  backgroundColor: "transparent",
  left: 0,
  overflow: "hidden",
  pointerEvents: "none",
  position: "fixed",
  top: 0,
  transformOrigin: "top left",
  transition: `transform ${PROXIMITY_VIDEO_TRANSITION_DURATION_MS}ms ${PROXIMITY_VIDEO_TRANSITION_EASING}, opacity ${PROXIMITY_VIDEO_TRANSITION_DURATION_MS}ms ${PROXIMITY_VIDEO_TRANSITION_EASING}`,
  width: "auto",
  willChange: "transform, opacity",
  zIndex: tokens.z.overlay,
  "@media": {
    [`screen and (max-width: ${mobilePageWidth}px)`]: {
      padding: 0,
    },
  },
})

export const proximityVideoFrame = style({
  border: "none",
  display: "block",
  height: "100%",
  width: "100%",
})

export const videoHeader = style({
  alignItems: "center",
  backgroundColor: tokens.color.bg,
  borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
  color: tokens.color.fg,
  display: "flex",
  fontSize: tokens.font.size.sm,
  justifyContent: "space-between",
})

export const headerTitle = style({
  fontWeight: tokens.font.weight.semibold,
  letterSpacing: "0.01em",
})

export const videoSection = style({
  backgroundColor: tokens.color.bg,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.xs,
  padding: tokens.space.sm,
})

export const videoSectionTitle = style({
  fontWeight: tokens.font.weight.semibold,
  color: tokens.color.fg,
})

export const videoSectionDescription = style({
  color: tokens.color.muted,
  display: "flex",
  flexDirection: "column",
  fontSize: tokens.font.size.xs,
  lineHeight: 1.4,
})
