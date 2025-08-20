// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import QuizPlayerClient from "./QuizPlayerClient";

const meta: Meta<typeof QuizPlayerClient> = {
  title: "Student/QuizPlayer",
  component: QuizPlayerClient
};

export default meta;
type Story = StoryObj<typeof QuizPlayerClient>;

export const Default: Story = {
  args: { quizId: "00000000-0000-0000-0000-000000000002" as any },
  render: (args) => <QuizPlayerClient {...(args as any)} />
};


