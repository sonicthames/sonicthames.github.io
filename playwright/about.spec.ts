import { expect, test } from "playwright/test"

test.describe("About page styling", () => {
  test("CTA uses the light contrast style", async ({ page }) => {
    await page.goto("/about")

    const cta = page.getByRole("button", { name: /explore the map/i })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveCSS("background-color", "rgb(255, 255, 255)")
    await expect(cta).toHaveCSS("color", "rgb(0, 0, 0)")
    await expect(cta).toHaveCSS("border-radius", "0px")
  })
})
