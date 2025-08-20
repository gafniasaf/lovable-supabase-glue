// @ts-nocheck
import { z } from "zod";
import { CourseId, LessonId, UserId } from "./ids";

export const markLessonCompleteRequest = z.object({ lessonId: LessonId, completed: z.boolean().default(true) }).strict();
export type MarkLessonCompleteRequest = z.infer<typeof markLessonCompleteRequest>;

export const progressItem = z.object({ lessonId: LessonId, completedAt: z.string() });
export type ProgressItem = z.infer<typeof progressItem>;

export const courseProgress = z.object({
  courseId: CourseId,
  totalLessons: z.number().int().min(0),
  completedLessons: z.number().int().min(0),
  percent: z.number().min(0).max(100)
});
export type CourseProgress = z.infer<typeof courseProgress>;

export const progressResponse = z.object({ courseProgress: courseProgress.optional(), latest: progressItem.optional() }).strict();
export type ProgressResponse = z.infer<typeof progressResponse>;


