import { tokens } from "@theme/tokens.css"
import { recipe } from "@vanilla-extract/recipes"

export const buttonRecipe = recipe({
  base: {
    alignItems: "center",
    border: "1px solid transparent",
    cursor: "pointer",
    display: "inline-flex",
    fontWeight: tokens.font.weight.medium,
    gap: tokens.space.sm,
    justifyContent: "center",
    textDecoration: "none",
    transition: `background ${tokens.motion.fast}, color ${tokens.motion.fast}, box-shadow ${tokens.motion.fast}`,
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
      cta: {
        background: tokens.color.contrast.light,
        color: tokens.color.contrast.dark,
        borderColor: tokens.color.contrast.dark,
        borderRadius: "0",
        selectors: {
          "&:hover:not(:disabled)": {
            background: tokens.color.surface,
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
