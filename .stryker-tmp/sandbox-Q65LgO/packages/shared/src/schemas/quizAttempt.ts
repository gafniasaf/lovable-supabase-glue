/**
 * Quiz attempt schemas
 *
 * Zod schemas for quiz attempts and related actions.
 */
// @ts-nocheck

import { z } from "zod";
import { QuizAttemptId, QuizId, UserId, QuizQuestionId, QuizChoiceId } from "./ids";

export const quizAttempt = z.object({
  id: QuizAttemptId,
  quiz_id: QuizId,
  student_id: UserId,
  started_at: z.string(),
  submitted_at: z.string().optional().nullable(),
  score: z.number().int().min(0).max(1000)
});
export type QuizAttempt = z.infer<typeof quizAttempt>;

export const quizAttemptStartRequest = z.object({
  quiz_id: QuizId
}).strict();
export type QuizAttemptStartRequest = z.infer<typeof quizAttemptStartRequest>;

export const quizAnswerUpsertRequest = z.object({
  attempt_id: QuizAttemptId,
  question_id: QuizQuestionId,
  choice_id: QuizChoiceId
}).strict();
export type QuizAnswerUpsertRequest = z.infer<typeof quizAnswerUpsertRequest>;

export const quizAttemptSubmitRequest = z.object({
  attempt_id: QuizAttemptId
}).strict();
export type QuizAttemptSubmitRequest = z.infer<typeof quizAttemptSubmitRequest>;



