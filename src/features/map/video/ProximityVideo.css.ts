import { style } from "@vanilla-extract/css"
import { tokens } from "@/theme/tokens.css"
import {
  PROXIMITY_VIDEO_TRANSITION_DURATION_MS,
  PROXIMITY_VIDEO_TRANSITION_EASING,
} from "./proximityVideoConstants"

export const proximityVideo = style({
  position: "fixed",
  display: "inline-flex",
  width: "auto",
  height: "auto",
  flexDirection: "column",
  alignItems: "stretch",
  gap: tokens.space.xs,
  borderRadius: 0,
  overflow: "hidden",
  backgroundColor: "transparent",
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

export const theatreBackdrop = style({
  position: "fixed",
  inset: 0,
  backgroundColor: tokens.color.overlay.medium,
  opacity: 0,
  transition: `opacity ${PROXIMITY_VIDEO_TRANSITION_DURATION_MS}ms ${PROXIMITY_VIDEO_TRANSITION_EASING}`,
  pointerEvents: "none",
  zIndex: tokens.z.overlay,
})

export const theatreBackdropVisible = style({
  opacity: 1,
  pointerEvents: "auto",
})

export const videoHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${tokens.space.xs} ${tokens.space.sm}`,
  fontSize: tokens.font.size.sm,
  color: tokens.color.fg,
  borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
})

export const headerTitle = style({
  fontWeight: tokens.font.weight.semibold,
  letterSpacing: "0.01em",
})

export const headerButton = style({
  appearance: "none",
  border: "none",
  borderRadius: tokens.radius.md,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: tokens.color.fg,
  padding: `${tokens.space.xs} ${tokens.space.sm}`,
  fontSize: tokens.font.size.xs,
  cursor: "pointer",
  opacity: 0.9,
  transition: `opacity ${tokens.motion.fast}`,
  selectors: {
    "&:hover": {
      opacity: 1,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    "&:focus-visible": {
      outline: `2px solid ${tokens.color.accent}`,
      outlineOffset: "2px",
    },
  },
})

export const theatreFooter = style({
  padding: `${tokens.space.sm} ${tokens.space.md}`,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  marginTop: tokens.space.sm,
})

export const theatreFooterHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: tokens.space.sm,
})

export const theatreFooterTitle = style({
  fontWeight: tokens.font.weight.semibold,
  color: tokens.color.fg,
})

export const theatreFooterDescription = style({
  fontSize: tokens.font.size.xs,
  color: tokens.color.muted,
  lineHeight: 1.4,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.xs,
})
