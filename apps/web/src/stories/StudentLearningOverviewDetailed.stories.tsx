import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/StudentLearningOverviewDetailed",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Learning Overview Detailed" src="/labs/student/learning-overview-detailed" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


