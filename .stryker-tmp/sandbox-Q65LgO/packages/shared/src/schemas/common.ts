// @ts-nocheck
import { z } from "zod";

export const appRole = z.enum(["student", "teacher", "parent", "admin"]);
export type AppRole = z.infer<typeof appRole>;

export const problem = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  details: z.record(z.unknown()).optional(),
  requestId: z.string().optional()
});
export type Problem = z.infer<typeof problem>;


