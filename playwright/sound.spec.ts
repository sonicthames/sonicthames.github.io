import { expect, test } from "./fixtures"

test.describe("Sound page", () => {
  test("fits a phone screen without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto("/sound/jetty")
    await expect(
      page.getByRole("heading", { name: "Wooden Jetty" }),
    ).toBeVisible()

    const overflow = await page
      .locator("main")
      .evaluate((main) => main.scrollWidth - main.clientWidth)
    expect(overflow).toBe(0)
  })
})
