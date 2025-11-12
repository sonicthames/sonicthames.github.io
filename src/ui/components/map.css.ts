/**
 * Drawer and panel styles using composable recipes.
 * All values now match original Tailwind exactly via token corrections.
 */
import {
  backdropRecipe,
  drawerContainer,
  panelRecipe,
} from "@theme/recipes/layout.css"
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"

// Re-export with legacy names for backward compatibility
export const drawer = drawerContainer
export const drawerBackdrop = backdropRecipe({ tone: "dark45", blur: "md" })
export const drawerPanel = panelRecipe({ kind: "drawer" })
export const sidePanel = panelRecipe({ kind: "side" })

export const markerBadge = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: tokens.radius.pill,
  padding: tokens.space.xs,
  border: "1px solid rgba(255, 255, 255, 1)",
})

export const markerWrapper = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  selectors: {
    "&:hover": {
      zIndex: tokens.z.overlay,
    },
  },
})

export const markerButton = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  transform: "translate(-50%, -100%)",
})

export const navigationControlPosition = style({
  position: "absolute",
  inset: "50px 50px auto auto",
})

export const mapFogOverlay = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  background:
    "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.5) 100%)",
  zIndex: tokens.z.base,
})
