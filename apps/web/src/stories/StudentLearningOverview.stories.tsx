import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/StudentLearningOverview",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Student Learning Overview" src="/labs/student/learning-overview" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


