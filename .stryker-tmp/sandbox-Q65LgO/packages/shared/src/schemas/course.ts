/**
 * Course schemas
 *
 * Zod schemas for course entities and request payloads.
 * - CourseCreateRequest: payload for creating a course
 * - CourseUpdateRequest: payload for updating a course (at least one field)
 * - Course: persisted course shape
 */
// @ts-nocheck

import { z } from "zod";
import { CourseId } from "./ids";
import { launchKind, scope } from "./interactive";

export const courseCreateRequest = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(2000).optional().nullable(),
  launch_kind: launchKind.optional().nullable(),
  launch_url: z.string().url().optional().nullable(),
  scopes: z.array(scope).optional().nullable(),
  provider_id: z.string().uuid().optional().nullable(),
}).strict();
export type CourseCreateRequest = z.infer<typeof courseCreateRequest>;

export const courseUpdateRequest = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(1).max(2000).nullable().optional(),
  launch_kind: launchKind.optional().nullable(),
  launch_url: z.string().url().optional().nullable(),
  scopes: z.array(scope).optional().nullable(),
  provider_id: z.string().uuid().optional().nullable(),
}).strict().refine((obj) => typeof obj.title !== 'undefined' || typeof obj.description !== 'undefined', {
  message: 'At least one field must be provided'
});
export type CourseUpdateRequest = z.infer<typeof courseUpdateRequest>;

export const course = z.object({
  id: CourseId,
  title: z.string(),
  description: z.string().nullable(),
  teacherId: z.string(),
  createdAt: z.string()
});
export type Course = z.infer<typeof course>;


