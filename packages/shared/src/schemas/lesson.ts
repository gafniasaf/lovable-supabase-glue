/**
 * Lesson schemas
 *
 * Zod schemas for lessons and related API payloads.
 * - Lesson: persisted lesson row
 * - LessonCreateRequest: payload for creating a lesson
 * - LessonReorderRequest: payload for bulk reordering within a course
 */
import { z } from "zod";

export const lesson = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  content: z.string(),
  order_index: z.number().int().min(1),
  file_key: z.string().optional().nullable(),
  created_at: z.string()
});
export type Lesson = z.infer<typeof lesson>;

export const lessonCreateRequest = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  content: z.string().default(""),
  order_index: z.number().int().min(1).default(1),
  file_key: z.string().optional()
}).strict();
export type LessonCreateRequest = z.infer<typeof lessonCreateRequest>;

export const lessonReorderRequest = z.object({
  course_id: z.string().uuid(),
  items: z.array(z.object({ id: z.string().uuid(), order_index: z.number().int().min(1) })).min(1)
}).strict();
export type LessonReorderRequest = z.infer<typeof lessonReorderRequest>;


