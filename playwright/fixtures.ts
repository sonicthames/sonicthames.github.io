import { test as base, expect } from "playwright/test"

// The e2e build's placeholder token makes Mapbox log tile, style and
// telemetry failures on every page.
const isMapboxNoise = (text: string, url: string) =>
  url.includes("mapbox") || text.includes("mapbox.com")

export const test = base.extend<{
  mapboxOffline: undefined
  runtimeErrors: string[]
}>({
  // With the placeholder token every Mapbox request fails anyway; failing at once
  // keeps the map's load event prompt and the suite off the network.
  mapboxOffline: [
    async ({ page }, use) => {
      await page.route(/^https:\/\/(?:api|events)\.mapbox\.com\//, (route) =>
        route.abort(),
      )
      await use(undefined)
    },
    { auto: true },
  ],
  runtimeErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on("pageerror", (error) => {
        errors.push(`pageerror: ${error.message}`)
      })
      page.on("console", (message) => {
        if (
          message.type() === "error" &&
          !isMapboxNoise(message.text(), message.location().url)
        ) {
          errors.push(`console.error: ${message.text()}`)
        }
      })
      await use(errors)
      expect(errors, "runtime errors on the page").toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
