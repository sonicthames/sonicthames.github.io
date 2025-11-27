import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import react from "@vitejs/plugin-react"
import type { UserConfig } from "vite"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
    vanillaExtractPlugin(),
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
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["playwright/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": "/src",
      "@theme": "/src/theme",
      "@ui": "/src/ui",
    },
  },
} satisfies UserConfig)
