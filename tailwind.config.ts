import type { Config } from "tailwindcss"

export default {
  darkMode: "class",
  content: ["./public/index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        fg: "rgb(var(--color-fg) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          dark: "rgb(var(--color-primary-dark) / <alpha-value>)",
          light: "rgb(var(--color-primary-light) / <alpha-value>)",
        },
        action: {
          DEFAULT: "rgb(var(--color-action) / <alpha-value>)",
          dark: "rgb(var(--color-action-dark) / <alpha-value>)",
          light: "rgb(var(--color-action-light) / <alpha-value>)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      spacing: {
        page: "var(--spacing-page)",
      },
    },
  },
  plugins: [],
} satisfies Config
