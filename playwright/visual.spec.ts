import { expect, test } from "./fixtures"

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
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("about.png")
  })

  test("Contact page", async ({ page }) => {
    await page.goto("/contact")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("contact.png")
  })
})
