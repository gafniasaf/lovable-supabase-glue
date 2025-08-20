import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Pages/Settings",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Settings Page" src="/dashboard/settings" style={{ width: '100%', height: '80vh', border: '0' }} />
  )
};


