import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import SearchOverlayClient from "@/app/components/SearchOverlayClient";

const meta = {
  title: "Navigation/SearchOverlay",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <SearchOverlayClient />
    </div>
  )
};
