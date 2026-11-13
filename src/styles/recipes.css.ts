import { tokens } from "@theme/tokens.css"
import { recipe } from "@vanilla-extract/recipes"

export const panel = recipe({
  base: {
    background: tokens.color.surface,
    border: `1px solid ${tokens.color.surfaceAlt}`,
    boxShadow: tokens.shadow.lg,
    color: tokens.color.text,
    padding: tokens.space.xl,
  },
  variants: {
    elevated: {
      true: {
        boxShadow: tokens.shadow.glowSoft,
      },
    },
    size: {
      sm: {
        padding: tokens.space.md,
      },
      md: {
        padding: tokens.space.lg,
      },
      lg: {
        padding: tokens.space["2xl"],
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
    color: tokens.color.brand.accent,
    textDecoration: "none",
    transition: `opacity ${tokens.motion.fast}`,
    ":hover": {
      opacity: 0.8,
    },
    ":visited": {
      color: tokens.color.brand.accent,
    },
  },
  variants: {
    variant: {
      // Inline links sit in white body text, so colour alone does not mark them.
      default: {
        textDecoration: "underline",
      },
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
