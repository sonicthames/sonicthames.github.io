import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      // Enable React Hooks rules with compiler diagnostics
      ...reactHooks.configs["recommended-latest"].rules,
      // Ensure React Compiler rules are enforced
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ignores: [
      "dist",
      "build",
      "node_modules",
      "*.config.js",
      "*.config.ts",
      "scripts/**",
      "src/icon/**/*.js",
      "src/icon/generated/**",
    ],
  },
)
