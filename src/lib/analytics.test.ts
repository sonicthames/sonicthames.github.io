import { describe, expect, it, vi } from "vitest"

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  capture:
    vi.fn<
      (
        event: string,
        properties: Record<string, unknown>,
        options: { readonly timestamp: Date },
      ) => void
    >(),
}))
vi.mock("posthog-js", () => ({ default: posthog }))

describe("analytics", () => {
  it("sends page views from before PostHog loads with their own URL", async () => {
    vi.stubEnv("VITE_POSTHOG_KEY", "key")
    vi.stubEnv("VITE_POSTHOG_HOST", "https://posthog.example")
    let load: (() => void) | undefined
    vi.stubGlobal("requestIdleCallback", (callback: () => void) => {
      load = callback
    })
    const { initAnalytics, trackPageView } = await import("./analytics")

    initAnalytics()
    window.history.replaceState(null, "", "/about")
    trackPageView()
    window.history.replaceState(null, "", "/contact")
    trackPageView()
    trackPageView()
    load?.()

    await vi.waitFor(() => {
      expect(posthog.capture).toHaveBeenCalledTimes(2)
    })
    expect(posthog.init).toHaveBeenCalledWith(
      "key",
      expect.objectContaining({ capture_pageview: false }),
    )
    expect(
      posthog.capture.mock.calls.map(([event, properties, options]) => [
        event,
        properties["$pathname"],
        options.timestamp instanceof Date,
      ]),
    ).toEqual([
      ["$pageview", "/about", true],
      ["$pageview", "/contact", true],
    ])
  })
})
