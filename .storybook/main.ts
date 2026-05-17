import type { StorybookConfig } from "@storybook/react-vite"
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin"
import { mergeConfig } from "vite"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: "@storybook/react-vite",
  viteFinal(config) {
    return mergeConfig(config, {
      plugins: [vanillaExtractPlugin()],
      resolve: {
        alias: {
          "@": "/src",
          "@theme": "/src/theme",
          "@ui": "/src/ui",
        },
      },
    })
  },
}

export default config
