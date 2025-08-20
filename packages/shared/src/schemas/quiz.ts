/**
 * Quiz schemas
 *
 * Zod schemas for quizzes and related request payloads.
 */
import { z } from "zod";
import { QuizId, CourseId } from "./ids";

export const quiz = z.object({
  id: QuizId,
  course_id: CourseId,
  title: z.string().min(3).max(200),
  time_limit_sec: z.number().int().min(10).max(7200).optional().nullable(),
  points: z.number().int().min(0).max(1000).default(100),
  created_at: z.string()
});
export type Quiz = z.infer<typeof quiz>;

export const quizCreateRequest = z.object({
  course_id: CourseId,
  title: z.string().min(3).max(200),
  time_limit_sec: z.number().int().min(10).max(7200).optional().nullable(),
  points: z.number().int().min(0).max(1000).optional().default(100)
}).strict();
export type QuizCreateRequest = z.infer<typeof quizCreateRequest>;

export const quizUpdateRequest = z.object({
  title: z.string().min(3).max(200).optional(),
  time_limit_sec: z.number().int().min(10).max(7200).optional().nullable(),
  points: z.number().int().min(0).max(1000).optional()
}).strict().refine(v => typeof v.title !== 'undefined' || typeof v.time_limit_sec !== 'undefined' || typeof v.points !== 'undefined', {
  message: 'At least one field must be provided'
});
export type QuizUpdateRequest = z.infer<typeof quizUpdateRequest>;



