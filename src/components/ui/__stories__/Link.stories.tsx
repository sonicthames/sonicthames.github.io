import type { Meta, StoryObj } from "@storybook/react"
import { Link } from "../Link"

const meta = {
  title: "UI/Link",
  component: Link,
  tags: ["autodocs", "visual", "a11y"],
  argTypes: {
    variant: { control: "select", options: ["default", "inherit"] },
  },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { to: "/about", children: "About page" },
}

export const Inherit: Story = {
  args: { to: "/contact", children: "Contact us", variant: "inherit" },
  decorators: [
    (Story) => (
      <p style={{ color: "crimson" }}>
        Parent color: <Story />
      </p>
    ),
  ],
}
