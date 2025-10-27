import { recipe } from "@vanilla-extract/recipes"
import { vars } from "./theme.css"

export const panel = recipe({
  base: {
    background: `rgb(${vars.color.bg})`,
    color: `rgb(${vars.color.fg})`,
    borderRadius: vars.radius.xl,
    boxShadow: vars.shadow.card,
    padding: "16px",
  },
  variants: {
    elevated: {
      true: {
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
      },
    },
    size: {
      sm: {
        padding: "8px",
      },
      md: {
        padding: "16px",
      },
      lg: {
        padding: "24px",
      },
    },
  },
  defaultVariants: {
    elevated: false,
    size: "md",
  },
})

export const link = recipe({
  base: {
    color: `rgb(${vars.color.action})`,
    textDecoration: "none",
    transition: "opacity 150ms",
    ":hover": {
      opacity: 0.8,
    },
    ":visited": {
      color: `rgb(${vars.color.action})`,
    },
  },
  variants: {
    variant: {
      default: {},
      inherit: {
        color: "inherit",
        ":visited": {
          color: "inherit",
        },
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
})
