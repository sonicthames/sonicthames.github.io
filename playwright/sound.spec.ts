import { expect, test } from "./fixtures"

test.describe("Sound page", () => {
  test("leaves out a description that repeats the title", async ({ page }) => {
    await page.goto("/sound/jetty")
    await expect(
      page.getByRole("heading", { name: "Wooden Jetty" }),
    ).toBeVisible()
    await expect(
      page.locator("main p", { hasText: /^Wooden Jetty$/ }),
    ).toHaveCount(0)
  })

  test("links a web address in a description", async ({ page }) => {
    await page.goto("/sound/here")
    await expect(
      page.getByRole("link", { name: "proteindance.co.uk/production" }),
    ).toHaveAttribute("href", "https://proteindance.co.uk/production")
  })

  test("opens a sound from anywhere on its card's text", async ({ page }) => {
    await page.goto("/listen")
    // The title link's overlay covers the text; click where the text is.
    const box = await page
      .getByText(/^Coming from a landscape with many industrial/)
      .boundingBox()
    if (box === null) throw new Error("description not laid out")
    await page.mouse.click(box.x + 8, box.y + box.height / 2)
    await expect(page).toHaveURL(/\/sound\/curve$/)
  })

  test("shows a thumbnail until the video is played", async ({ page }) => {
    await page.goto("/sound/jetty")
    const play = page.getByRole("button", { name: "Play Wooden Jetty" })
    await expect(play).toBeVisible()
    await expect(page.locator("iframe")).toHaveCount(0)
    await play.click()
    await expect(page.locator('iframe[src*="autoplay=1"]')).toHaveCount(1)
  })
})
