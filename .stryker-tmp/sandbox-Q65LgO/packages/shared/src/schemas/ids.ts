// @ts-nocheck
import { z } from "zod";

/**
 * Branded identifiers to improve type safety across contracts.
 * Runtime validation is still standard Zod (uuid/string), but TS types
 * become nominal via brand to avoid accidental mixups.
 */
export const CourseId = z.string().uuid().brand<"CourseId">();
export type CourseId = z.infer<typeof CourseId>;

export const LessonId = z.string().uuid().brand<"LessonId">();
export type LessonId = z.infer<typeof LessonId>;

export const ModuleId = z.string().uuid().brand<"ModuleId">();
export type ModuleId = z.infer<typeof ModuleId>;

export const AssignmentId = z.string().uuid().brand<"AssignmentId">();
export type AssignmentId = z.infer<typeof AssignmentId>;

export const SubmissionId = z.string().uuid().brand<"SubmissionId">();
export type SubmissionId = z.infer<typeof SubmissionId>;

export const QuizId = z.string().uuid().brand<"QuizId">();
export type QuizId = z.infer<typeof QuizId>;

export const QuizQuestionId = z.string().uuid().brand<"QuizQuestionId">();
export type QuizQuestionId = z.infer<typeof QuizQuestionId>;

export const QuizChoiceId = z.string().uuid().brand<"QuizChoiceId">();
export type QuizChoiceId = z.infer<typeof QuizChoiceId>;

export const QuizAttemptId = z.string().uuid().brand<"QuizAttemptId">();
export type QuizAttemptId = z.infer<typeof QuizAttemptId>;

export const UserId = z.string().uuid().brand<"UserId">();
export type UserId = z.infer<typeof UserId>;

export const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(1).max(120).brand<"Slug">();
export type Slug = z.infer<typeof Slug>;


