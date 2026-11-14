import { expect, test } from "./fixtures"

test.describe("Contact page", () => {
  test("renders the contact form and helper text", async ({ page }) => {
    await page.goto("/contact")

    await expect(
      page.getByRole("heading", { name: /send us a message/i }),
    ).toBeVisible()
    await expect(
      page.getByText(/send us a message here to get in touch/i),
    ).toBeVisible()

    await expect(page.getByLabel("Name")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Message")).toBeVisible()
    await expect(
      page.getByRole("button", { name: /send message/i }),
    ).toBeVisible()
  })

  test("puts the name and email into the mailto body", async ({ page }) => {
    await page.goto("/contact")
    await page.getByLabel("Name").fill("Ada")
    await page.getByLabel("Email").fill("ada@example.com")
    await page.getByLabel("Message").fill("Hello there")
    await page.getByRole("button", { name: /send message/i }).click()

    const href = await page
      .getByRole("status")
      .getByRole("link")
      .getAttribute("href")
    const mailto = new URL(href ?? "")
    expect(mailto.pathname).toBe("sonicthames@gmail.com")
    expect(mailto.searchParams.get("body")).toBe(
      "Hello there\n\nFrom: Ada <ada@example.com>",
    )
  })

  test("submit button uses the light contrast style", async ({ page }) => {
    await page.goto("/contact")

    const submit = page.getByRole("button", { name: /send message/i })
    await expect(submit).toHaveCSS("background-color", "rgb(255, 255, 255)")
    await expect(submit).toHaveCSS("color", "rgb(0, 0, 0)")
  })
})
