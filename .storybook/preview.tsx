import type { Preview } from "@storybook/react-vite"
import { MemoryRouter } from "react-router"
import "@fontsource-variable/inter"
import "@fontsource-variable/montserrat"
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
