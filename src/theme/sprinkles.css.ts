import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles"
import { tokens } from "./tokens.css"

const layoutProperties = defineProperties({
  properties: {
    display: ["none", "block", "inline", "inline-block", "flex", "grid"],
    flexDirection: ["row", "column"],
    alignItems: ["stretch", "flex-start", "center", "flex-end"],
    justifyContent: ["flex-start", "center", "space-between", "flex-end"],
    gap: tokens.space,
    padding: tokens.space,
    margin: tokens.space,
    borderRadius: tokens.radius,
    boxShadow: tokens.shadow,
    color: {
      text: tokens.color.text,
      muted: tokens.color.muted,
      primary: tokens.color.brand.primary,
      accent: tokens.color.brand.accent,
    },
    background: {
      surface: tokens.color.surface,
      surfaceAlt: tokens.color.surfaceAlt,
      overlay: tokens.color.overlay.base,
    },
  },
})

export const sprinkles = createSprinkles(layoutProperties)

export type Sprinkles = Parameters<typeof sprinkles>[0]
