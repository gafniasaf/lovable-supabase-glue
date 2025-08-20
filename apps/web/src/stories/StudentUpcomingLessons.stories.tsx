import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/StudentUpcomingLessons",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Student Upcoming Lessons" src="/labs/student/upcoming-lessons" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


