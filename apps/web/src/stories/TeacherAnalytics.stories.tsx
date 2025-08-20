import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Pages/TeacherAnalytics",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe
      title="Teacher Analytics"
      // Example course id; page should handle empty/placeholder states gracefully
      src="/dashboard/teacher/00000000-0000-0000-0000-000000000000/analytics"
      style={{ width: '100%', height: '80vh', border: '0' }}
    />
  )
};


