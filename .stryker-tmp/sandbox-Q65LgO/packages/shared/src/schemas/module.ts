/**
 * Module schemas
 *
 * Zod schemas for course modules used to group lessons.
 * - Module: persisted module row
 * - ModuleCreateRequest: payload for creating a module
 * - ModuleUpdateRequest: payload for updating fields (at least one required)
 */
// @ts-nocheck

import { z } from "zod";

export const moduleSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  order_index: z.number().int().min(1),
  created_at: z.string()
});
export type Module = z.infer<typeof moduleSchema>;

export const moduleCreateRequest = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  order_index: z.number().int().min(1).default(1)
}).strict();
export type ModuleCreateRequest = z.infer<typeof moduleCreateRequest>;

export const moduleUpdateRequest = z.object({
  title: z.string().min(3).max(200).optional(),
  order_index: z.number().int().min(1).optional()
}).strict().refine(obj => Object.keys(obj).length > 0, { message: "At least one field is required" });
export type ModuleUpdateRequest = z.infer<typeof moduleUpdateRequest>;



