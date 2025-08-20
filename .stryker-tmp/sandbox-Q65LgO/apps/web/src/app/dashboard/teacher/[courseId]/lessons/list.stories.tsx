// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Page from "../page";

const meta: Meta<typeof Page> = {
  title: "Teacher/Course/Lessons",
  component: Page,
  parameters: { layout: "fullscreen" }
};

export default meta;
type Story = StoryObj<typeof Page>;

export const Default: Story = {
  args: { params: { courseId: "00000000-0000-0000-0000-000000000001" } as any },
  render: (args) => <Page {...(args as any)} />
};


