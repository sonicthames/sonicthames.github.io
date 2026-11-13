import { defineConfig } from "playwright/test"

const ci = Boolean(process.env["CI"])
const port = 4748
const baseURL = process.env["PLAYWRIGHT_BASE_URL"] ?? `http://127.0.0.1:${port}`
// Set by bin/visual-docker.sh, which runs Chromium in the Playwright image.
const dockerWsEndpoint = process.env["PLAYWRIGHT_DOCKER_WS"]

export default defineConfig({
  testDir: "./playwright",
  snapshotPathTemplate: "{testDir}/{testFileName}-snapshots/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      scale: "css",
      // Docker renders identically run to run; a ratio-based budget let a
      // restyled button (about 4,000 pixels) pass unnoticed.
      maxDiffPixels: 100,
    },
  },
  fullyParallel: true,
  // Every route also mounts the WebGL map, which starves CPU-bound workers.
  workers: ci ? 2 : 4,
  forbidOnly: ci,
  retries: ci ? 2 : 0,
  use: {
    baseURL,
    ...(dockerWsEndpoint === undefined
      ? {}
      : {
          // The containerised browser reaches the host's preview server
          // through the Playwright connection.
          connectOptions: {
            wsEndpoint: dockerWsEndpoint,
            exposeNetwork: "<loopback>",
          },
        }),
    trace: "on-first-retry",
  },
  webServer: {
    command: `pnpm build:e2e && pnpm exec vite preview --outDir dist-e2e --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    env: { BROWSER: "none" },
    reuseExistingServer: !ci,
    timeout: 120_000,
  },
})
