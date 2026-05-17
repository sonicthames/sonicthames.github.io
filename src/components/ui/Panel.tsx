import type * as React from "react"
import { cn } from "@/lib/utils"
import { panel as panelRecipe } from "@/styles/recipes.css"

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  size?: "sm" | "md" | "lg"
}

export const Panel = ({
  className,
  elevated,
  size,
  ref,
  ...props
}: PanelProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
  return (
    <div
      className={cn(panelRecipe({ elevated, size }), className)}
      ref={ref}
      {...props}
    />
  )
}

Panel.displayName = "Panel"
