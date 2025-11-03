import { tokens } from "@theme/tokens.css"
import { recipe } from "@vanilla-extract/recipes"

export const buttonRecipe = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: tokens.font.weight.medium,
    borderRadius: tokens.radius.md,
    transition: `background ${tokens.motion.fast}, color ${tokens.motion.fast}, box-shadow ${tokens.motion.fast}`,
    cursor: "pointer",
    border: "1px solid transparent",
    textDecoration: "none",
    gap: tokens.space.sm,
    selectors: {
      "&:disabled": {
        cursor: "not-allowed",
        opacity: 0.5,
      },
      "&:focus-visible": {
        outline: "none",
        boxShadow: tokens.shadow.glowSoft,
      },
    },
  },
  variants: {
    tone: {
      primary: {
        background: tokens.color.brand.primary,
        color: tokens.color.text,
        selectors: {
          "&:hover:not(:disabled)": {
            background: tokens.color.brand.accent,
          },
        },
      },
      ghost: {
        background: "transparent",
        borderColor: "transparent",
        color: tokens.color.text,
        selectors: {
          "&:hover:not(:disabled)": {
            background: tokens.color.hover.light, // FIXED: gray-100 instead of dark overlay
          },
        },
      },
      link: {
        background: "transparent",
        color: tokens.color.brand.accent,
        borderColor: "transparent",
        selectors: {
          "&:hover:not(:disabled)": {
            opacity: 0.8,
          },
        },
      },
    },
    size: {
      sm: {
        height: "32px",
        padding: `0 ${tokens.space.sm}`,
        fontSize: tokens.font.size.sm,
      },
      md: {
        height: "40px",
        padding: `0 ${tokens.space.md}`,
        fontSize: tokens.font.size.md,
      },
      lg: {
        height: "48px",
        padding: `0 ${tokens.space.lg}`,
        fontSize: tokens.font.size.lg,
      },
    },
    fullWidth: {
      true: {
        width: "100%",
      },
    },
  },
  defaultVariants: {
    tone: "primary",
    size: "md",
  },
})
