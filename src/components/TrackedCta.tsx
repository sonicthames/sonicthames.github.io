import type * as React from "react"
import type { ButtonProps } from "@/components/ui"
import { Button } from "@/components/ui"
import { useHoverAnalytics } from "@/hooks/useHoverAnalytics"
import { trackCtaClick } from "@/lib/analytics"

export interface TrackedCtaProps extends ButtonProps {
  readonly ctaId: string
  readonly label?: string
  readonly location?: string
}

export const TrackedCta = ({
  ctaId,
  label,
  location = "global",
  onClick,
  children,
  tone,
  variant,
  ref,
  ...buttonProps
}: TrackedCtaProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
  const inferredLabel =
    label ??
    (typeof children === "string" ? children : buttonProps["aria-label"])

  const hoverHandlers = useHoverAnalytics({
    ctaId,
    label: inferredLabel,
    location,
  })

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    trackCtaClick({
      cta_id: ctaId,
      label: inferredLabel,
      location,
      path: window.location.pathname,
    })

    if (onClick) {
      onClick(event)
    }
  }

  const resolvedTone = tone ?? variant ?? "cta"

  return (
    <Button
      ref={ref}
      onClick={handleClick}
      {...hoverHandlers}
      tone={resolvedTone}
      {...buttonProps}
    >
      {children}
    </Button>
  )
}

TrackedCta.displayName = "TrackedCta"
