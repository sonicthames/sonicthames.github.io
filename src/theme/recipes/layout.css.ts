import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

/**
 * Backdrop overlay recipe
 * Used for drawer backdrop with blur and overlay
 */
export const backdropRecipe = recipe({
  base: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  variants: {
    tone: {
      dark45: {
        background: tokens.color.overlay.medium,
      },
      none: {
        background: "transparent",
      },
    },
    blur: {
      md: {
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      },
      none: {
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
      },
    },
  },
  defaultVariants: {
    tone: "none",
    blur: "none",
  },
})

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
        position: "relative",
        zIndex: tokens.z.overlay,
        width: "100%",
        maxWidth: "100%",
        background: tokens.color.surface,
        color: tokens.color.text,
        boxShadow: tokens.shadow.drawer,
      },
      side: {
        width: "100%",
        maxWidth: "100%",
        background: tokens.color.surfaceAlt,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
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
 * Surface padding utility
 * Responsive padding for page/surface containers
 */
export const surfacePadding = style({
  padding: "24px 16px",
  "@media": {
    "screen and (min-width: 640px)": {
      padding: "24px 32px",
    },
  },
})

/**
 * Transition slide utility
 * For drawer open/close animations
 */
export const transitionSlide = style({
  transition: `transform ${tokens.motion.normal} ease-out`,
  willChange: "transform",
})

/**
 * Button bare recipe
 * For list/playlist items with proper hover states
 */
export const buttonBare = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    padding: tokens.space.sm,
    borderRadius: tokens.radius.md,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: `background-color ${tokens.motion.fast} ease, color ${tokens.motion.fast} ease`,
    color: "inherit",
    textDecoration: "none",
  },
  variants: {
    hoverable: {
      true: {
        selectors: {
          "&:hover": {
            background: tokens.color.hover.light,
          },
        },
      },
      false: {},
    },
    focused: {
      true: {
        background: tokens.color.hover.focus,
      },
      false: {},
    },
  },
  defaultVariants: {
    hoverable: true,
    focused: false,
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
