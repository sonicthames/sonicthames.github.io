import { expect, test } from "./fixtures"

test.describe("Navigation", () => {
  test("restores a deep link that 404.html packed into the query string", async ({
    page,
  }) => {
    await page.goto("/?/about&utm_source=x~and~b=2#top")

    await expect(page.getByRole("heading", { name: "About" })).toBeVisible()
    const url = new URL(page.url())
    expect(url.pathname).toBe("/about")
    expect(url.search).toBe("?utm_source=x&b=2")
    expect(url.hash).toBe("#top")
  })

  test("keeps a page open when Escape is pressed in a field", async ({
    page,
  }) => {
    await page.goto("/contact")
    const message = page.getByLabel("Message")
    await message.fill("Half a thought")
    await message.press("Escape")

    await expect(page).toHaveURL(/\/contact$/)
    await expect(message).toHaveValue("Half a thought")
  })

  test("moves focus into an opened page and closes it with Escape", async ({
    page,
  }) => {
    await page.goto("/")
    const aboutLink = page.getByRole("link", { name: "ABOUT" }).first()
    await aboutLink.click()
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible()

    const focusInDrawer = await page.evaluate(() => {
      const focused = document.activeElement
      return (
        focused !== null &&
        focused !== document.body &&
        focused.closest("[inert]") === null
      )
    })
    expect(focusInDrawer).toBe(true)
    await expect(page.locator("[inert] canvas").first()).toBeAttached()

    await page.keyboard.press("Escape")
    await expect(page).toHaveURL(/\/main$/)
    await expect(aboutLink).toBeFocused()
  })

  test("rings a control focused from the keyboard", async ({ page }) => {
    await page.goto("/contact")
    await page.getByLabel("Message").press("Tab")

    const send = page.getByRole("button", { name: "Send message" })
    await expect(send).toBeFocused()
    await expect(send).toHaveCSS("outline-style", "solid")
  })

  test("rings the map when its canvas has keyboard focus", async ({ page }) => {
    await page.goto("/")
    const canvas = page.locator(".mapboxgl-canvas")
    await page.keyboard.press("Tab")
    await canvas.focus()

    const ring = await page
      .locator(".mapboxgl-map")
      .evaluate((map) => getComputedStyle(map, "::after").outlineStyle)
    expect(ring).toBe("solid")
  })

  test("marks the current page in the nav", async ({ page }) => {
    await page.goto("/about")
    const header = page
      .locator("header")
      .filter({ has: page.getByRole("link", { name: "Map", exact: true }) })
    await expect(
      header.getByRole("link", { name: "About", exact: true }),
    ).toHaveAttribute("aria-current", "page")
  })

  test("keeps the whole header on a phone screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/about")
    const header = page
      .locator("header")
      .filter({ has: page.getByRole("link", { name: "Map", exact: true }) })
    for (const item of [
      header.getByText("Sonic Thames", { exact: true }),
      header.getByRole("link", { name: "Map", exact: true }),
      header.getByRole("link", { name: "Contact", exact: true }),
    ]) {
      await expect(item).toBeInViewport({ ratio: 1 })
    }
  })

  test("titles each page", async ({ page }) => {
    await page.goto("/main")
    await expect(page).toHaveTitle("Sonic Thames")
    await page.goto("/about")
    await expect(page).toHaveTitle("About · Sonic Thames")
    // GitHub Pages redirects /sound/jetty to the page the build wrote for it.
    await page.goto("/sound/jetty/")
    await expect(page).toHaveTitle("Wooden Jetty · Sonic Thames")
    await page.keyboard.press("Escape")
    await expect(page).toHaveTitle("Sonic Thames")
  })

  test("leads back to the map from a missing page", async ({ page }) => {
    await page.goto("/no-such-page")
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible()
    await page.getByRole("link", { name: "Back to the map" }).click()
    await expect(page).toHaveURL(/\/main$/)
  })

  test("serves the manifest icons", async ({ request }) => {
    for (const icon of ["/logo192.png", "/logo512.png"]) {
      const response = await request.get(icon)
      expect(response.headers()["content-type"]).toBe("image/png")
    }
  })
})
