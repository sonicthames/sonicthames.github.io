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
})
