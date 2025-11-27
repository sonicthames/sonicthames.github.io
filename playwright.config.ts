import { defineConfig } from "playwright/test"

export default defineConfig({
  testDir: "./playwright",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4747",
    headless: true,
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev:test",
    port: 4747,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_MAPBOX_TOKEN:
        process.env.VITE_MAPBOX_TOKEN ?? "pk.test-playwright-token",
    },
  },
})
