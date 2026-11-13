import type { PostHog } from "posthog-js"

type QueuedEvent = readonly [
  event: string,
  payload: Record<string, unknown>,
  timestamp: Date,
]

const MAX_QUEUED_EVENTS = 50

let client: PostHog | null = null
let enabled = false
let lastPageUrl: string | null = null
const queue: QueuedEvent[] = []

const getEnv = (key: "VITE_POSTHOG_KEY" | "VITE_POSTHOG_HOST") => {
  const value = import.meta.env[key]
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined
}

const send = (posthog: PostHog, [event, payload, timestamp]: QueuedEvent) => {
  try {
    posthog.capture(event, payload, { timestamp })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[analytics] Failed to capture event:", event, error)
    }
  }
}

export const initAnalytics = () => {
  if (enabled) {
    return
  }

  const apiKey = getEnv("VITE_POSTHOG_KEY")
  const apiHost = getEnv("VITE_POSTHOG_HOST")

  if (!apiKey || !apiHost) {
    if (import.meta.env.DEV) {
      console.info(
        "[analytics] Missing VITE_POSTHOG_KEY or VITE_POSTHOG_HOST – analytics disabled.",
      )
    }
    return
  }

  enabled = true
  const load = () => {
    import("posthog-js")
      .then(({ default: posthog }) => {
        posthog.init(apiKey, {
          api_host: apiHost,
          autocapture: true,
          capture_pageview: false,
          capture_pageleave: true,
          persistence: "localStorage+cookie",
        })
        client = posthog
        for (const queued of queue.splice(0)) {
          send(posthog, queued)
        }
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.error("[analytics] Failed to load PostHog:", error)
        }
      })
  }

  // PostHog is about a third of the entry chunk, so it waits for an idle moment.
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(load, { timeout: 3000 })
  } else {
    setTimeout(load, 1000)
  }
}

const captureEvent = (event: string, payload: Record<string, unknown>) => {
  if (client) {
    send(client, [event, payload, new Date()])
  } else if (enabled && queue.length < MAX_QUEUED_EVENTS) {
    queue.push([event, payload, new Date()])
  }
}

/**
 * Records a page view for the current URL. The router calls this on every
 * navigation, so views from before PostHog loads are queued like other events.
 */
export const trackPageView = () => {
  const { host, href, pathname } = window.location
  // A redirect or a repeated link lands on the URL already recorded.
  if (href === lastPageUrl) {
    return
  }
  lastPageUrl = href
  // A queued view is sent later, so it carries its own URL.
  captureEvent("$pageview", {
    $current_url: href,
    $host: host,
    $pathname: pathname,
  })
}

interface CtaEventBase {
  readonly cta_id: string
  readonly label?: string | undefined
  readonly location?: string | undefined
  readonly path?: string | undefined
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
