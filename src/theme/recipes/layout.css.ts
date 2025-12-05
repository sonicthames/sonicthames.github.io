import { tokens } from "@theme/tokens.css"
import { recipe } from "@vanilla-extract/recipes"

/**
 * Panel recipe for drawer and side panel
 * Matches exact Tailwind styles with corrected tokens
 */
export const panelRecipe = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    pointerEvents: "auto",
  },
  variants: {
    kind: {
      drawer: {
        WebkitBackdropFilter: tokens.effect.blur.md,
        backdropFilter: tokens.effect.blur.md,
        boxShadow: tokens.shadow.drawer,
        color: tokens.color.text,
        maxWidth: "100%",
        position: "relative",
        width: "100%",
        zIndex: tokens.z.overlay,
      },
      side: {
        width: "100%",
        maxWidth: "100%",
        backdropFilter: tokens.effect.blur.md,
        WebkitBackdropFilter: tokens.effect.blur.md,
        boxShadow: tokens.shadow.sidePanel,
        "@media": {
          "screen and (min-width: 768px)": {
            width: "440px",
          },
          "screen and (min-width: 1024px)": {
            width: "500px",
          },
        },
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
        inset: 0,
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
