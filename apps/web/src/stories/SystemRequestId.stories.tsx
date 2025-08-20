import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/SystemRequestId",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Request ID" src="/labs/system/request-id" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


