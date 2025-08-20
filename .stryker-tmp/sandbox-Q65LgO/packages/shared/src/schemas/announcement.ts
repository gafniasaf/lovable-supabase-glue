// @ts-nocheck
import { z } from "zod";

export const announcement = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  file_key: z.string().optional().nullable(),
  publish_at: z.string().datetime().nullable().optional(),
  created_at: z.string()
});
export type Announcement = z.infer<typeof announcement>;

export const announcementCreateRequest = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  file_key: z.string().optional().nullable(),
  publish_at: z.union([z.string().datetime(), z.null()]).optional()
});
export type AnnouncementCreateRequest = z.infer<typeof announcementCreateRequest>;

export const announcementDeleteRequest = z.object({
  id: z.string().uuid()
});
export type AnnouncementDeleteRequest = z.infer<typeof announcementDeleteRequest>;


