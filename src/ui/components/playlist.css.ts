import { body } from "@theme/recipes/text.css"
import { tokens } from "@theme/tokens.css"
import { style } from "@vanilla-extract/css"
import { recipe } from "@vanilla-extract/recipes"

export const playlist = style({
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: tokens.space.sm,
})

export const playlistItem = recipe({
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.space.lg,
    cursor: "pointer",
    transition: "background-color 150ms ease-in-out",
  },
  variants: {
    focused: {
      true: {
        background: tokens.color.hover.focus,
      },
    },
  },
  defaultVariants: {
    focused: false,
  },
})

export const playlistName = style([
  body.default,
  {
    flex: "1 1 auto",
  },
])

export const iconButton = style([
  {
    border: "none",
    background: "transparent",
    padding: tokens.space.sm,
    borderRadius: tokens.radius.sm,
    cursor: "pointer",
    transition: "background-color 150ms ease-in-out",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
    selectors: {
      "&:hover": {
        background: tokens.color.hover.light,
      },
    },
  },
])
