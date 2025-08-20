import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/ParentChildrenAdvanced",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Parent Children Advanced" src="/labs/parent/children-directory-advanced" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


