/**
 * Assignment schemas
 *
 * Zod schemas for assignments and related API payloads.
 * - Assignment: persisted assignment row
 * - AssignmentCreateRequest: payload for creating a new assignment
 * - AssignmentUpdateRequest: partial update payload (requires at least one field)
 */
// @ts-nocheck

import { z } from "zod";

export const assignment = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(4000).nullable().optional(),
  due_at: z.string().datetime().nullable().optional(),
  points: z.number().int().min(0).max(1000).default(100),
  created_at: z.string()
});
export type Assignment = z.infer<typeof assignment>;

export const assignmentCreateRequest = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(4000).optional(),
  due_at: z.string().datetime().optional(),
  points: z.number().int().min(0).max(1000).optional()
}).strict();
export type AssignmentCreateRequest = z.infer<typeof assignmentCreateRequest>;

export const assignmentUpdateRequest = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(4000).optional(),
  due_at: z.string().datetime().optional(),
  points: z.number().int().min(0).max(1000).optional()
}).strict().refine(obj => Object.keys(obj).length > 0, { message: "At least one field required" });
export type AssignmentUpdateRequest = z.infer<typeof assignmentUpdateRequest>;


