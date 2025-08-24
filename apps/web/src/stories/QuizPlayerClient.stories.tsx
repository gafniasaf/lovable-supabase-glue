import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import QuizPlayerClient from "@/app/dashboard/student/[courseId]/quizzes/[quizId]/play/QuizPlayerClient";

const meta = {
  title: "Student/QuizPlayer",
  component: QuizPlayerClient,
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof QuizPlayerClient>;

export default meta;

type Story = StoryObj<typeof QuizPlayerClient>;

const sampleQuestions = [
  { id: "q1", quiz_id: "quiz-1", text: "What is 2 + 2?", order_index: 1 },
  { id: "q2", quiz_id: "quiz-1", text: "Capital of France?", order_index: 2 }
];

const sampleChoices: Record<string, any[]> = {
  q1: [
    { id: "c1", question_id: "q1", text: "3", correct: false, order_index: 1 },
    { id: "c2", question_id: "q1", text: "4", correct: true, order_index: 2 }
  ],
  q2: [
    { id: "c3", question_id: "q2", text: "Paris", correct: true, order_index: 1 },
    { id: "c4", question_id: "q2", text: "Berlin", correct: false, order_index: 2 }
  ]
};

export const Default: Story = {
  args: {
    quizId: "quiz-1",
    questions: sampleQuestions as any,
    choicesByQuestion: sampleChoices as any,
    timeLimitSec: 90
  },
  render: (args) => <QuizPlayerClient {...(args as any)} />
};
