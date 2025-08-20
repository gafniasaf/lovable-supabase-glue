import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import TeacherDashboard from "./page";

const meta: Meta<typeof TeacherDashboard> = {
  title: "Dashboards/Teacher",
  component: TeacherDashboard,
  parameters: { layout: "fullscreen" }
};

export default meta;
type Story = StoryObj<typeof TeacherDashboard>;

export const Default: Story = { render: () => <TeacherDashboard /> };


