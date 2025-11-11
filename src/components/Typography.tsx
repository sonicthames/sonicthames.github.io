import { heading } from "@theme/recipes/text.css"
import type { ReactNode } from "react"

interface HeadingProps {
  readonly children: ReactNode
  readonly id?: string
  readonly className?: string
}

export const H1 = ({ children, className, ...props }: HeadingProps) => (
  <h1 className={`${heading.h1} ${className || ""}`} {...props}>
    {children}
  </h1>
)

export const H2 = ({ children, className, ...props }: HeadingProps) => (
  <h2 className={`${heading.h2} ${className || ""}`} {...props}>
    {children}
  </h2>
)

export const H3 = ({ children, className, ...props }: HeadingProps) => (
  <h3 className={`${heading.h3} ${className || ""}`} {...props}>
    {children}
  </h3>
)
