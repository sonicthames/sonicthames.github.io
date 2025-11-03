import { buttonRecipe } from "@theme/recipes/button.css"
import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonRecipeVariants = NonNullable<Parameters<typeof buttonRecipe>[0]>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonRecipeVariants["tone"]
  size?: ButtonRecipeVariants["size"]
  fullWidth?: ButtonRecipeVariants["fullWidth"]
  /**
   * @deprecated use `tone` instead.
   */
  variant?: ButtonRecipeVariants["tone"]
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, tone, variant, size, fullWidth, ...props }, ref) => {
    const resolvedTone = tone ?? variant ?? "primary"
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
  },
)

Button.displayName = "Button"
