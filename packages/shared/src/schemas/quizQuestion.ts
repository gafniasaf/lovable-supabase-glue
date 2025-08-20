/**
 * Quiz question schemas
 *
 * Zod schemas for quiz questions and create payloads.
 */
import { z } from "zod";
import { QuizQuestionId, QuizId } from "./ids";

export const quizQuestion = z.object({
  id: QuizQuestionId,
  quiz_id: QuizId,
  text: z.string().min(3).max(500),
  order_index: z.number().int().min(1)
});
export type QuizQuestion = z.infer<typeof quizQuestion>;

export const quizQuestionCreateRequest = z.object({
  quiz_id: QuizId,
  text: z.string().min(3).max(500),
  order_index: z.number().int().min(1).default(1)
}).strict();
export type QuizQuestionCreateRequest = z.infer<typeof quizQuestionCreateRequest>;



