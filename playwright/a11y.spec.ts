import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "playwright/test"

const pages = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
]

for (const { name, path } of pages) {
  test(`${name} page has no critical a11y violations`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState("domcontentloaded")

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()

    const serious = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    )

    if (serious.length > 0) {
      const summary = serious
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} instance${v.nodes.length === 1 ? "" : "s"})`,
        )
        .join("\n")
      expect
        .soft(serious, `A11y violations on ${name}:\n${summary}`)
        .toEqual([])
    }
  })
}
