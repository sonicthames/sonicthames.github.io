import { expect, test } from "playwright/test"

test.describe("Contact page", () => {
  test("renders the contact form and helper text", async ({ page }) => {
    await page.goto("/contact")

    await expect(
      page.getByRole("heading", { name: /send us a message/i }),
    ).toBeVisible()
    await expect(
      page.getByText(/get in touch with us by sending us a message/i),
    ).toBeVisible()

    await expect(page.getByLabel("Name")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Message")).toBeVisible()
    await expect(
      page.getByRole("button", { name: /send message/i }),
    ).toBeVisible()
  })
})
