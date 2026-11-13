import { expect, test } from "./fixtures"

test.describe("Main map experience", () => {
  test("renders the map with fog and sound marker overlays", async ({
    page,
  }) => {
    await page.goto("/")

    await expect(page.getByRole("img", { name: /logo/i })).toBeVisible()
    await expect(page.getByTestId("map-fog-overlay")).toBeVisible()
    await expect(page.getByTestId("sound-markers-layer")).toBeVisible()
    await expect(page.locator("canvas.mapboxgl-canvas").first()).toBeVisible()

    // The two Pixi overlays mount their canvases once Mapbox fires `load`.
    await expect(page.locator("canvas")).toHaveCount(4)
  })
})
