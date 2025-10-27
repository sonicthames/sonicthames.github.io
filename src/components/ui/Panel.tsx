import * as React from "react"
import { cn } from "@/lib/utils"
import { panel as panelRecipe } from "@/styles/recipes.css"

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  size?: "sm" | "md" | "lg"
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, elevated, size, ...props }, ref) => {
    return (
      <div
        className={cn(panelRecipe({ elevated, size }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)

Panel.displayName = "Panel"
