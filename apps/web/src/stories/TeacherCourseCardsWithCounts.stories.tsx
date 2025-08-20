import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Labs/TeacherCourseCardsWithCounts",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Teacher Course Cards With Counts" src="/labs/teacher/course-cards-with-counts" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


