import { tokens } from "@theme/tokens.css"
import { recipe } from "@vanilla-extract/recipes"

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
