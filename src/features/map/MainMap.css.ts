/**
 * Map component styles - co-located with Map.tsx
 */
import { tokens } from "@theme/tokens.css"
import { globalStyle, style } from "@vanilla-extract/css"

// Fog and marker canvases cover the map and its focus ring, so the ring is drawn over the whole map.
globalStyle(".mapboxgl-canvas:focus-visible", {
  outline: "none",
})

globalStyle(".mapboxgl-map:has(.mapboxgl-canvas:focus-visible)::after", {
  content: '""',
  inset: 0,
  outline: `2px solid ${tokens.color.brand.accent}`,
  outlineOffset: "-2px",
  pointerEvents: "none",
  position: "absolute",
  zIndex: tokens.z.overlay,
})

export const logoPosition = style({
  position: "absolute",
  inset: "auto -40px -85px auto",
  width: "20rem",
  pointerEvents: "none",
  transition: `opacity ${tokens.motion.normal}`,
  zIndex: tokens.z.overlay,
})

export const logoHidden = style({
  opacity: 0,
})

export const debugControls = style({
  position: "absolute",
  top: tokens.space.md,
  left: tokens.space.md,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.xs,
  zIndex: tokens.z.overlay,
})

export const restoreFogButton = style({
  // Legacy positioning removed; uses shared debug container
  padding: "8px 16px",
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  color: tokens.color.contrast.light,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  fontFamily: "monospace",
  zIndex: tokens.z.overlay,
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.85)",
    },
  },
})

export const revealFogButton = style({
  // Legacy positioning removed; uses shared debug container
  padding: "8px 16px",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  color: tokens.color.contrast.light,
  border: "1px solid rgba(255, 255, 255, 0.3)",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
  fontFamily: "monospace",
  zIndex: tokens.z.overlay,
  selectors: {
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.35)",
    },
  },
})

export const walkHint = style({
  background: "rgb(0 0 0 / 0.6)",
  border: "1px solid rgb(255 255 255 / 0.2)",
  borderRadius: "999px",
  color: tokens.color.text,
  fontSize: tokens.font.size.sm,
  left: "50%",
  margin: 0,
  padding: `${tokens.space.xs} ${tokens.space.md}`,
  pointerEvents: "none",
  position: "absolute",
  top: `calc(50% + ${tokens.space["2xl"]})`,
  transform: "translateX(-50%)",
  whiteSpace: "nowrap",
  zIndex: tokens.z.overlay,
})

const coarsePointer = "(pointer: coarse)"

export const walkHintPointer = style({
  "@media": { [coarsePointer]: { display: "none" } },
})

export const walkHintTouch = style({
  display: "none",
  "@media": { [coarsePointer]: { display: "inline" } },
})
