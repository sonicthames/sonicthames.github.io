import { expect, test } from "./fixtures"

test.describe("About page styling", () => {
  test("CTA uses the accent outline style", async ({ page }) => {
    await page.goto("/about")

    const cta = page.getByRole("button", { name: /explore the map/i })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
    await expect(cta).toHaveCSS("color", "rgb(103, 232, 249)")
    await expect(cta).toHaveCSS("border-top-color", "rgb(103, 232, 249)")
    await expect(cta).toHaveCSS("border-radius", "0px")
  })
})
