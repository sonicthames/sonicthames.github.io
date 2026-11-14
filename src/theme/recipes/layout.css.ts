import { tokens } from "@theme/tokens.css"
import { recipe } from "@vanilla-extract/recipes"

/**
 * Panel recipe for the drawer
 * Matches exact Tailwind styles with corrected tokens
 */
export const panelRecipe = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    pointerEvents: "auto",
    selectors: {
      // Focus lands here programmatically when a page opens; the panel itself
      // is not interactive.
      "&:focus": { outline: "none" },
    },
  },
  variants: {
    kind: {
      drawer: {
        background: tokens.color.overlay.base,
        WebkitBackdropFilter: tokens.effect.blur.md,
        backdropFilter: tokens.effect.blur.md,
        color: tokens.color.text,
        maxWidth: "100%",
        position: "relative",
        width: "100%",
        zIndex: tokens.z.overlay,
      },
    },
  },
  defaultVariants: {
    kind: "drawer",
  },
})

/**
 * Drawer container recipe
 * Manages open/closed state and transitions
 */
export const drawerContainer = recipe({
  base: {
    position: "absolute",
    display: "flex",
    zIndex: tokens.z.overlay,
    transition: `transform ${tokens.motion.normal} ease-out`,
    willChange: "transform",
  },
  variants: {
    open: {
      true: {
        // Mapbox terms require the logo and attribution to stay visible while the map shows, even behind an open page.
        inset: `0 0 ${tokens.space["2xl"]} 0`,
        pointerEvents: "auto",
        justifyContent: "center",
        transform: "translateX(0)",
      },
      false: {
        inset: "0 0 0 auto",
        pointerEvents: "none",
        justifyContent: "flex-end",
        transform: "translateX(100%)",
        padding: 0,
      },
    },
  },
  defaultVariants: {
    open: false,
  },
})
