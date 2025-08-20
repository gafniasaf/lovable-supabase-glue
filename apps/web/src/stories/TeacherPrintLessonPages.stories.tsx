import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/TeacherPrint",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const CoursePrint: Story = {
  render: () => (
    <iframe title="Teacher Course Print" src="/labs/teacher/00000000-0000-0000-0000-000000000000/print" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};

export const LessonsPrintSummary: Story = {
  render: () => (
    <iframe title="Lessons Print Summary" src="/labs/teacher/00000000-0000-0000-0000-000000000000/lessons-print-summary" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};

export const CoursesPrintPack: Story = {
  render: () => (
    <iframe title="Courses Print Pack" src="/labs/teacher/courses-print-pack?ids=00000000-0000-0000-0000-000000000000" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


