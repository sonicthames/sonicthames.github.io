import type { Meta, StoryObj } from "@storybook/react"
import { Panel } from "../Panel"

const meta = {
  title: "UI/Panel",
  component: Panel,
  tags: ["autodocs", "visual", "a11y"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    elevated: { control: "boolean" },
  },
} satisfies Meta<typeof Panel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Default panel content" },
}

export const Elevated: Story = {
  args: { children: "Elevated panel with glow", elevated: true },
}

export const Small: Story = {
  args: { children: "Small panel", size: "sm" },
}

export const Large: Story = {
  args: { children: "Large panel", size: "lg" },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Panel size="sm">Small</Panel>
      <Panel size="md">Medium</Panel>
      <Panel size="lg">Large</Panel>
      <Panel size="md" elevated>
        Medium elevated
      </Panel>
    </div>
  ),
}
