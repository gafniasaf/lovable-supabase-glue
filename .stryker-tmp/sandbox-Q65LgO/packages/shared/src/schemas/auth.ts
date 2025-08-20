/**
 * Authentication schemas
 *
 * Zod schemas for auth flows and profile shapes shared across the app.
 */
// @ts-nocheck

import { z } from "zod";

export const userRole = z.enum(["student", "teacher", "parent"]);

export const loginRequest = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
export type LoginRequest = z.infer<typeof loginRequest>;

export const profileResponse = z.object({
  id: z.string(),
  email: z.string().email(),
  role: userRole,
  display_name: z.string().min(1).max(120).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  preferences: z.record(z.any()).default({})
});
export type ProfileResponse = z.infer<typeof profileResponse>;

export const profileUpdateRequest = z.object({
  display_name: z.string().min(1).max(120).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  preferences: z.record(z.any()).optional()
});
export type ProfileUpdateRequest = z.infer<typeof profileUpdateRequest>;


