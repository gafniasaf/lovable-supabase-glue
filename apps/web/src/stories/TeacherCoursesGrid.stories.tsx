import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/TeacherCoursesGrid",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Teacher Courses Grid" src="/labs/teacher/courses-grid" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


