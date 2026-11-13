import { test as base, expect } from "playwright/test"

// The e2e build's placeholder token makes Mapbox log tile, style and
// telemetry failures on every page.
const isMapboxNoise = (text: string, url: string) =>
  url.includes("mapbox") || text.includes("mapbox.com")

export const test = base.extend<{ runtimeErrors: string[] }>({
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
