import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "../Button"

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs", "visual", "a11y"],
  argTypes: {
    tone: {
      control: "select",
      options: ["primary", "cta", "ghost", "link"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { children: "Primary", tone: "primary" },
}

export const CTA: Story = {
  args: { children: "Explore the map", tone: "cta" },
}

export const Ghost: Story = {
  args: { children: "Cancel", tone: "ghost" },
}

export const LinkTone: Story = {
  args: { children: "Learn more", tone: "link" },
}

export const Small: Story = {
  args: { children: "Small", size: "sm" },
}

export const Large: Story = {
  args: { children: "Large", size: "lg" },
}

export const FullWidth: Story = {
  args: { children: "Full width", fullWidth: true },
}

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
}

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button tone="primary">Primary</Button>
      <Button tone="cta">CTA</Button>
      <Button tone="ghost">Ghost</Button>
      <Button tone="link">Link</Button>
    </div>
  ),
}
