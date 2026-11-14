import { expect, test } from "./fixtures"

test.describe("Main map experience", () => {
  test("renders the map with fog and sound marker overlays", async ({
    page,
  }) => {
    await page.goto("/")

    // The map is lazy-loaded, and parsing Mapbox in a busy browser takes a while.
    await expect(page.locator("canvas.mapboxgl-canvas").first()).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByTestId("map-fog-overlay")).toBeVisible()
    await expect(page.getByTestId("sound-markers-layer")).toBeVisible()

    // The two Pixi overlays mount their canvases once Mapbox fires `load`.
    await expect(page.locator("canvas")).toHaveCount(4)
  })

  test("tells a first-time visitor how to move", async ({ page }) => {
    await page.goto("/")
    const hint = page.getByText("Click the map to walk there.")
    await expect(hint).toBeVisible({ timeout: 15_000 })
    await expect(page.locator("canvas")).toHaveCount(4)
    await page.mouse.click(400, 400)
    await expect(hint).toBeHidden()
  })

  test("keeps pages working when the map cannot load", async ({
    page,
    runtimeErrors,
  }) => {
    await page.route(/\/assets\/map-[^/]*\.js$/, (route) => route.abort())
    await page.goto("/about")

    await expect(page.getByRole("heading", { name: "About" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByText(/the map could not load/i)).toBeVisible()

    expect(runtimeErrors.some((error) => error.includes("Render error"))).toBe(
      true,
    )
    runtimeErrors.splice(0)
  })
})
