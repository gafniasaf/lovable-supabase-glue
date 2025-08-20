/**
 * User schemas
 *
 * Zod schemas for user management actions.
 */
// @ts-nocheck

import { z } from "zod";

export const updateRoleRequest = z.object({
	userId: z.string().uuid(),
	role: z.enum(["student", "teacher", "parent", "admin"])
});
export type UpdateRoleRequest = z.infer<typeof updateRoleRequest>;


