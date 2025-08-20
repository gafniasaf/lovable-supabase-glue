import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Dashboards/Overview",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Student: Story = {
  render: () => (
    <iframe title="Student Dashboard" src="/dashboard/student" style={{ width: '100%', height: '80vh', border: '0' }} />
  )
};

export const Teacher: Story = {
  render: () => (
    <iframe title="Teacher Dashboard" src="/dashboard/teacher" style={{ width: '100%', height: '80vh', border: '0' }} />
  )
};

export const Admin: Story = {
  render: () => (
    <iframe title="Admin Dashboard" src="/dashboard/admin" style={{ width: '100%', height: '80vh', border: '0' }} />
  )
};