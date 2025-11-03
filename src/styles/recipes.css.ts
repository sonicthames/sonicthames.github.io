import { vars } from "@theme/vars.css"
import { recipe } from "@vanilla-extract/recipes"

export const panel = recipe({
  base: {
    background: vars.color.surface,
    color: vars.color.text,
    border: `1px solid ${vars.color.surfaceAlt}`,
    borderRadius: vars.radius.xl,
    boxShadow: vars.shadow.lg,
    padding: vars.space.xl,
  },
  variants: {
    elevated: {
      true: {
        boxShadow: vars.shadow.glowSoft,
      },
    },
    size: {
      sm: {
        padding: vars.space.md,
      },
      md: {
        padding: vars.space.lg,
      },
      lg: {
        padding: vars.space["2xl"],
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
    color: vars.color.brand.accent,
    textDecoration: "none",
    transition: `opacity ${vars.motion.fast}`,
    ":hover": {
      opacity: 0.8,
    },
    ":visited": {
      color: vars.color.brand.accent,
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
