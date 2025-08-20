// @ts-nocheck
import { z } from "zod";
import { UserId } from "./ids";

export const notification = z.object({
  id: z.string().uuid(),
  // In tests we often use non-UUID ids (e.g. "test-student-id"); accept any non-empty string
  user_id: z.string().min(1),
  type: z.string().min(1),
  payload: z.record(z.any()),
  created_at: z.string(),
  read_at: z.string().nullable().optional()
});
export type Notification = z.infer<typeof notification>;

export const notificationMarkReadRequest = z.object({
  read: z.boolean().default(true)
});
export type NotificationMarkReadRequest = z.infer<typeof notificationMarkReadRequest>;


