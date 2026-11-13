import { buttonRecipe } from "@theme/recipes/button.css"
import type * as React from "react"
import { cn } from "@/lib/utils"

type ButtonRecipeVariants = NonNullable<Parameters<typeof buttonRecipe>[0]>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonRecipeVariants["tone"]
  size?: ButtonRecipeVariants["size"]
  fullWidth?: ButtonRecipeVariants["fullWidth"]
}

export const Button = ({
  className,
  tone,
  size,
  fullWidth,
  ref,
  ...props
}: ButtonProps & {
  ref?: React.RefObject<HTMLButtonElement | null> | undefined
}) => {
  const resolvedTone = tone ?? "primary"
  return (
    <button
      className={cn(
        buttonRecipe({ tone: resolvedTone, size, fullWidth }),
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

Button.displayName = "Button"
