// @ts-nocheck
import { z } from "zod";
import { appRole } from "./common";
import { CourseId, LessonId, UserId } from "./ids";

export const kpi = z.object({ label: z.string(), value: z.number(), hint: z.string().optional() });

export const studentDashboard = z.object({
  kpis: z.object({ enrolledCourses: kpi, lessonsCompleted: kpi, assignmentsDue: kpi.optional() }),
  continueLearning: z
    .object({ courseId: CourseId, courseTitle: z.string(), nextLessonTitle: z.string().optional(), nextLessonId: LessonId.optional() })
    .optional(),
  courses: z.array(
    z.object({
      courseId: CourseId,
      title: z.string(),
      progress: z.object({ totalLessons: z.number().int().min(0), completedLessons: z.number().int().min(0), percent: z.number().min(0).max(100) })
    })
  )
}).strict();

export const teacherDashboard = z.object({
  kpis: z.object({
    activeCourses: kpi,
    studentsEnrolled: kpi,
    needsGrading: kpi.optional(),
    interactiveAttempts: kpi.optional(),
    interactivePassRate: kpi.optional()
  }),
  recentCourses: z.array(z.object({ id: CourseId, title: z.string(), createdAt: z.string() })).default([])
}).strict();

export const adminDashboard = z.object({
  kpis: z.object({ totalUsers: kpi, totalCourses: kpi, dailyActiveUsers: kpi }),
  recentActivity: z.array(z.object({ id: z.string(), message: z.string(), at: z.string() })).default([])
}).strict();

export const dashboardResponse = z.discriminatedUnion("role", [
  z.object({ role: z.literal("student"), data: studentDashboard }),
  z.object({ role: z.literal("teacher"), data: teacherDashboard }),
  z.object({ role: z.literal("admin"), data: adminDashboard }),
  z.object({ role: z.literal("parent"), data: z.object({ children: z.array(z.object({ childId: z.string(), name: z.string() })).default([]) }) })
]);
export type DashboardResponse = z.infer<typeof dashboardResponse>;


