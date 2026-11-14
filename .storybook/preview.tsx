import type { Preview } from "@storybook/react-vite"
import { MemoryRouter } from "react-router"
import "../src/index.css"
import "../src/theme/darkTheme.css"
import "../src/theme/global.css"

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default preview
