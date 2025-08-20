import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Pages/StudentAssignmentDetail",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe
      title="Student Assignment Detail"
      // Example IDs; page renders empty state if not found
      src="/dashboard/student/00000000-0000-0000-0000-000000000000/assignments/00000000-0000-0000-0000-000000000001"
      style={{ width: '100%', height: '80vh', border: '0' }}
    />
  )
};


