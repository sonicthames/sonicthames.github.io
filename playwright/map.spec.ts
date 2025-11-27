import { expect, test } from "playwright/test"

test.describe("Main map experience", () => {
  test("renders fog overlay, markers, and playlist", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("img", { name: /logo/i })).toBeVisible()
    await expect(page.getByTestId("map-fog-overlay")).toBeVisible()
    await expect(page.getByTestId("sound-markers-layer")).toBeVisible()

    const playlist = page.getByTestId("map-playlist")
    await expect(playlist).toBeVisible()

    const playlistItems = playlist.locator("li[data-sound-title]")
    await expect(playlistItems.first()).toBeVisible()
    expect(await playlistItems.count()).toBeGreaterThan(0)
    const firstTitle = await playlistItems
      .first()
      .getAttribute("data-sound-title")
    expect(firstTitle).toBeTruthy()

    await expect(page.locator("canvas.mapboxgl-canvas").first()).toBeVisible()
  })
})
