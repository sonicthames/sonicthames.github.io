import { expect, test } from "playwright/test"

test.describe("Visual snapshots", () => {
  test("About page", async ({ page }) => {
    await page.goto("/about")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("about.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    })
  })

  test("Contact page", async ({ page }) => {
    await page.goto("/contact")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("contact.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    })
  })
})
