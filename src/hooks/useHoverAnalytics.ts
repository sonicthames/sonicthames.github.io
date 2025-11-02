import { useCallback, useRef } from "react"
import { trackCtaHover } from "@/lib/analytics"

const MIN_DWELL_MS = 120

export interface HoverAnalyticsOptions {
  readonly ctaId: string
  readonly label?: string
  readonly location?: string
  readonly minDwellMs?: number
}

export const useHoverAnalytics = ({
  ctaId,
  label,
  location,
  minDwellMs = MIN_DWELL_MS,
}: HoverAnalyticsOptions) => {
  const enterTimestampRef = useRef<number | null>(null)

  const onMouseEnter = useCallback(() => {
    enterTimestampRef.current = performance.now()
  }, [])

  const onMouseLeave = useCallback(() => {
    const startedAt = enterTimestampRef.current
    enterTimestampRef.current = null

    if (startedAt == null) {
      return
    }

    const dwellMs = performance.now() - startedAt
    if (dwellMs < minDwellMs) {
      return
    }

    trackCtaHover({
      cta_id: ctaId,
      dwell_ms: Math.round(dwellMs),
      label,
      location,
      path: window.location.pathname,
    })
  }, [ctaId, label, location, minDwellMs])

  return {
    onMouseEnter,
    onMouseLeave,
  }
}
