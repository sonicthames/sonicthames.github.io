import type { Page } from "playwright/test"
import { expect, test } from "./fixtures"

// The map behind the drawer only reaches its final view after Mapbox fires
// `load`, which then mounts the two Pixi overlay canvases.
const waitForMap = async (page: Page) => {
  await page.waitForFunction(
    () => document.querySelectorAll("canvas").length >= 4,
    null,
    { timeout: 30_000 },
  )
  await page.waitForLoadState("networkidle")
}

// Chromium in Docker renders the map in software, so a capture can take longer
// than the default 5 seconds.
const SCREENSHOT_TIMEOUT_MS = 20_000

test.describe("@visual", () => {
  // Pages scroll inside the drawer, not the document, so the viewport has to
  // fit the tallest page.
  test.use({ viewport: { width: 1280, height: 1000 } })

  test.beforeAll(() => {
    if (process.env["PLAYWRIGHT_DOCKER_WS"] === undefined) {
      throw new Error(
        "Baselines render in the Playwright Docker image; run `pnpm test:visual`.",
      )
    }
  })

  test("About page", async ({ page }) => {
    await page.goto("/about")
    await waitForMap(page)
    await expect(page).toHaveScreenshot("about.png", {
      timeout: SCREENSHOT_TIMEOUT_MS,
    })
  })

  test("Contact page", async ({ page }) => {
    await page.goto("/contact")
    await waitForMap(page)
    await expect(page).toHaveScreenshot("contact.png", {
      timeout: SCREENSHOT_TIMEOUT_MS,
    })
  })
})
