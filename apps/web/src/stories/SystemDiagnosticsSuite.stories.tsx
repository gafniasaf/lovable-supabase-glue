import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/SystemDiagnosticsSuite",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Diagnostics Suite" src="/labs/system/diagnostics-suite" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


