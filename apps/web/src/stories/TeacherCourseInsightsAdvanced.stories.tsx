import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/TeacherCourseInsightsAdvanced",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Teacher Course Insights Advanced" src="/labs/teacher/course-insights-advanced" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


