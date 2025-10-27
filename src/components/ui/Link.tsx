import * as React from "react"
import type { LinkProps as RouterLinkProps } from "react-router-dom"
import { Link as RouterLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import { link as linkRecipe } from "@/styles/recipes.css"

export interface LinkProps extends Omit<RouterLinkProps, "to"> {
  to: string
  variant?: "default" | "inherit"
  className?: string
  children: React.ReactNode
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant = "default", to, children, ...props }, ref) => {
    return (
      <RouterLink
        to={to}
        className={cn(linkRecipe({ variant }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </RouterLink>
    )
  },
)

Link.displayName = "Link"
