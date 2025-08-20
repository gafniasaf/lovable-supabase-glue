// @ts-nocheck
import { z } from "zod";
import { assignment } from "../schemas/assignment";
import { submission } from "../schemas/submission";
import { quiz } from "../schemas/quiz";
import { message } from "../schemas/message";
import { notification } from "../schemas/notification";
import { dashboardResponse } from "../schemas/dashboard";
import { moduleSchema } from "../schemas/module";
import { enrollment } from "../schemas/enrollment";

// Assignments
export const assignmentDto = assignment;
export const assignmentListDto = z.array(assignment);

// Submissions
export const submissionDto = submission;
export const submissionListDto = z.array(submission);

// Quizzes
export const quizDto = quiz;
export const quizListDto = z.array(quiz);

// Messages
export const messageDto = message;
export const messageListDto = z.array(message);

// Notifications
export const notificationDto = notification;
export const notificationListDto = z.array(notification);

// Dashboard
export const dashboardDto = dashboardResponse;

// Runtime (interactive attempts)
export const runtimeAttemptDto = z.object({
  id: z.string().uuid().optional(),
  course_id: z.string().uuid(),
  user_id: z.string().uuid(),
  runtime_attempt_id: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  max: z.number().optional().nullable(),
  passed: z.boolean().optional().nullable(),
  pct: z.number().min(0).max(100).optional().nullable(),
  topic: z.string().optional().nullable(),
  created_at: z.string().optional(),
});
export const runtimeAttemptListDto = z.array(runtimeAttemptDto);

// Modules
export const moduleDto = moduleSchema;
export const moduleListDto = z.array(moduleSchema);

// Enrollments
export const enrollmentDto = enrollment;
export const enrollmentListDto = z.array(enrollment);


