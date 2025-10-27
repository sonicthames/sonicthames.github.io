import type { ComponentType, SVGProps } from "react"
import { cn } from "@/lib/utils"
import {
  Close,
  ExpandedView,
  Feel,
  FeelV0,
  Listen,
  Next,
  Play,
  Previous,
  See,
  WindowView,
} from "./generated"

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const ICONS = {
  Close,
  ExpandedView,
  Feel,
  FeelV0,
  Listen,
  Next,
  Play,
  Previous,
  See,
  WindowView,
} satisfies Record<string, IconComponent>

export type KnownIcons = keyof typeof ICONS
export type KnownIcon = KnownIcons

export interface IconProps {
  readonly name: KnownIcons
  readonly className?: string
  readonly height?: number | string
  readonly width?: number | string
  readonly color?: string
}

export const Icon = ({ name, className, ...props }: IconProps) => {
  const C = ICONS[name]
  return <C className={cn("overflow-visible", className)} {...props} />
}
