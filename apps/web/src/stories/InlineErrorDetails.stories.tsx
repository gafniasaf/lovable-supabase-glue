import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import InlineErrorDetails from "@/components/ui/InlineErrorDetails";

const meta = {
  title: "Feedback/InlineErrorDetails",
  parameters: { layout: "centered" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <InlineErrorDetails message="We couldn’t load your data." details={"Stack: ...\nCause: network error"} requestId="req-123456" />
    </div>
  )
};
