import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/ParentChildren",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Parent Children" src="/labs/parent/children" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


