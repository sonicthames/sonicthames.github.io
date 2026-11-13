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
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
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
