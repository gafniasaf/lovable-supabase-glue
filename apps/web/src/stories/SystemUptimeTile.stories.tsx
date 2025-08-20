import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/SystemUptimeTile",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Uptime Tile" src="/labs/system/uptime-tile" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


