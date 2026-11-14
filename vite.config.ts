import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import react from "@vitejs/plugin-react"
import { visualizer } from "rollup-plugin-visualizer"
import type { UserConfig } from "vite"
import { defineConfig } from "vitest/config"

const shouldOpenVisualizer = process.env["BUNDLE_STATS"] === "true"

export default defineConfig({
  plugins: [
    // A component the compiler cannot compile fails the build instead of
    // shipping without its optimisations.
    react({ compiler: { panicThreshold: "all_errors" } }),
    vanillaExtractPlugin(),
    visualizer({
      open: shouldOpenVisualizer,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
  ],
  server: {
    port: 4420,
    open: true,
  },
  preview: {
    port: 4421,
    open: true,
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["playwright/**", "node_modules/**"],
    env: {
      VITE_MAPBOX_TOKEN: "test-token",
    },
    coverage: {
      provider: "v8",
      // Components are left to the Playwright suites.
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.css.ts",
        "src/**/*.d.ts",
        "src/**/*.test.ts",
        "src/test/**",
      ],
      reporter: ["text-summary"],
      // Just under the current numbers, so coverage cannot fall unnoticed.
      // Raise them as tests are added.
      thresholds: {
        statements: 39,
        branches: 38,
        functions: 50,
        lines: 40,
      },
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // The map groups pull in their dependencies, which would put React and
            // Vite's preload helper in the lazily loaded map chunk and make the
            // entry chunk depend on it.
            {
              name: "vendor",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]|vite[\\/]preload-helper/,
              priority: 1,
            },
            {
              name: "mapbox",
              test: /[\\/]node_modules[\\/](mapbox-gl|react-map-gl)[\\/]/,
            },
            {
              name: "pixi",
              test: /[\\/]node_modules[\\/]pixi\.js[\\/]/,
            },
          ],
        },
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
} satisfies UserConfig)
