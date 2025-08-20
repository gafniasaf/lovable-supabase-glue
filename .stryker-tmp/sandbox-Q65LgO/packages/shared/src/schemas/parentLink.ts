/**
 * Parent link schemas
 *
 * Zod schemas modeling parent-child relationships and API payloads.
 */
// @ts-nocheck

import { z } from "zod";

export const parentLink = z.object({
	id: z.string().uuid(),
	parent_id: z.string().uuid(),
	student_id: z.string().uuid(),
	created_at: z.string()
});
export type ParentLink = z.infer<typeof parentLink>;

export const parentLinkCreateRequest = z.object({
	parent_id: z.string().min(3),
	student_id: z.string().min(3)
});
export type ParentLinkCreateRequest = z.infer<typeof parentLinkCreateRequest>;

export const parentLinkDeleteRequest = z.object({
	parent_id: z.string().min(3),
	student_id: z.string().min(3)
});
export type ParentLinkDeleteRequest = z.infer<typeof parentLinkDeleteRequest>;


