import { link as linkRecipe } from "@theme/recipes/link.css"
import type * as React from "react"
import type { LinkProps as RouterLinkProps } from "react-router"
import { Link as RouterLink } from "react-router"
import { cn } from "@/lib/utils"

export interface LinkProps extends Omit<RouterLinkProps, "to"> {
  to: string
  variant?: "default" | "inherit"
  className?: string
  children: React.ReactNode
}

export const Link = ({
  className,
  variant = "default",
  to,
  children,
  ref,
  ...props
}: LinkProps & { ref?: React.RefObject<HTMLAnchorElement | null> }) => {
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
}

Link.displayName = "Link"
