// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Teacher/Course Admin",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Lessons: Story = {
  render: () => (
    <iframe title="Lessons Admin" src="/dashboard/teacher" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};

export const Assignments: Story = {
  render: () => (
    <iframe title="Assignments List" src="/dashboard/teacher" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};

export const AnnouncementsEmpty: Story = {
  render: () => (
    <iframe title="Teacher Announcements (Empty)" src="/dashboard/teacher/test-course/announcements" style={{ width: '100%', height: '80vh', border: 0 }} />
  )
};


