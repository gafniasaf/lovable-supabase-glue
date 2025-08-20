/**
 * Submission schemas
 *
 * Zod schemas for assignment submissions and grading requests.
 */
// @ts-nocheck

import { z } from "zod";
import { SubmissionId, AssignmentId, UserId } from "./ids";

export const submission = z.object({
  id: SubmissionId,
  assignment_id: AssignmentId,
  student_id: UserId,
  text: z.string().max(10000).default(""),
  file_url: z.string().url().optional().nullable(),
  file_urls: z.array(z.string().url()).optional().default([]),
  submitted_at: z.string(),
  score: z.number().int().min(0).max(1000).optional().nullable(),
  feedback: z.string().max(4000).optional().nullable()
});
export type Submission = z.infer<typeof submission>;

export const submissionCreateRequest = z.object({
  assignment_id: AssignmentId,
  text: z.string().max(10000).default(""),
  file_url: z.string().url().optional(),
  file_urls: z.array(z.string().url()).optional()
}).strict();
export type SubmissionCreateRequest = z.infer<typeof submissionCreateRequest>;

export const submissionGradeRequest = z.object({
  score: z.number().int().min(0).max(1000),
  feedback: z.string().max(4000).optional()
}).strict();
export type SubmissionGradeRequest = z.infer<typeof submissionGradeRequest>;


