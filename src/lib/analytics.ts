import posthog from "posthog-js"

let isInitialised = false

const getEnv = (key: "VITE_POSTHOG_KEY" | "VITE_POSTHOG_HOST") => {
  const value = import.meta.env[key]
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined
}

export const initAnalytics = () => {
  if (isInitialised) {
    return posthog
  }

  const apiKey = getEnv("VITE_POSTHOG_KEY")
  const apiHost = getEnv("VITE_POSTHOG_HOST")

  if (!apiKey || !apiHost) {
    if (import.meta.env.DEV) {
      console.info(
        "[analytics] Missing VITE_POSTHOG_KEY or VITE_POSTHOG_HOST – analytics disabled.",
      )
    }
    return posthog
  }

  posthog.init(apiKey, {
    api_host: apiHost,
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  })

  isInitialised = true
  return posthog
}

const captureEvent = (event: string, payload: Record<string, unknown>) => {
  if (!isInitialised) {
    return
  }

  try {
    posthog.capture(event, payload)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[analytics] Failed to capture event:", event, error)
    }
  }
}

interface CtaEventBase {
  readonly cta_id: string
  readonly label?: string
  readonly location?: string
  readonly path?: string
  readonly [key: string]: string | number | boolean | null | undefined
}

export const trackCtaClick = (payload: CtaEventBase) => {
  captureEvent("cta_click", payload)
}

export const trackCtaHover = (
  payload: CtaEventBase & { readonly dwell_ms: number },
) => {
  captureEvent("cta_hover", payload)
}

export { posthog }
