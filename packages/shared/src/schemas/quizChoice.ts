/**
 * Quiz choice schemas
 *
 * Zod schemas for answer choices on quiz questions.
 */
import { z } from "zod";
import { QuizChoiceId, QuizQuestionId } from "./ids";

export const quizChoice = z.object({
  id: QuizChoiceId,
  question_id: QuizQuestionId,
  text: z.string().min(1).max(300),
  correct: z.boolean(),
  order_index: z.number().int().min(1)
});
export type QuizChoice = z.infer<typeof quizChoice>;

export const quizChoiceCreateRequest = z.object({
  question_id: QuizQuestionId,
  text: z.string().min(1).max(300),
  correct: z.boolean(),
  order_index: z.number().int().min(1).default(1)
}).strict();
export type QuizChoiceCreateRequest = z.infer<typeof quizChoiceCreateRequest>;



