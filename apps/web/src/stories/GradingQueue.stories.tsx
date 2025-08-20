import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Teacher/GradingQueue",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <iframe title="Grading Queue" src="/dashboard/teacher/grading-queue" style={{ width: '100%', height: '80vh', border: '0' }} />
  )
};

export const Empty: Story = {
  render: () => (
    <iframe title="Grading Queue (Empty)" src="/dashboard/teacher/grading-queue?courseId=&page=1&pageSize=20" style={{ width: '100%', height: '80vh', border: '0' }} />
  )
};


