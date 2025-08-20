import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/SystemPercentileTrends",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Percentile Trends" src="/labs/system/percentile-trends" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


