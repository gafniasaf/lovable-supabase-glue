import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import StudentDashboardPage from "./page";

const meta: Meta<typeof StudentDashboardPage> = {
  title: "Dashboards/Student",
  component: StudentDashboardPage,
  parameters: {
    layout: "fullscreen"
  }
};

export default meta;
type Story = StoryObj<typeof StudentDashboardPage>;

export const Default: Story = {
  render: () => <StudentDashboardPage />
};


