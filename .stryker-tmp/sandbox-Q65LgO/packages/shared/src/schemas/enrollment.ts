/**
 * Enrollment schemas
 *
 * Zod schemas representing student enrollments into courses and request payloads.
 */
// @ts-nocheck

import { z } from "zod";

export const enrollment = z.object({
  id: z.string().uuid(),
  student_id: z.string(),
  course_id: z.string().uuid(),
  created_at: z.string()
});
export type Enrollment = z.infer<typeof enrollment>;

export const enrollmentCreateRequest = z.object({
  course_id: z.string().uuid()
});
export type EnrollmentCreateRequest = z.infer<typeof enrollmentCreateRequest>;


