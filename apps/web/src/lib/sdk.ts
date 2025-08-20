import { createAnnouncementsGateway, AnnouncementsGateway } from "@/lib/data/announcements";
import { createAssignmentsGateway, AssignmentsGateway } from "@/lib/data/assignments";
import { createCoursesGateway, CoursesGateway } from "@/lib/data/courses";
import { createDashboardGateway, DashboardGateway } from "@/lib/data/dashboard";
import { createEnrollmentsGateway, EnrollmentsGateway } from "@/lib/data/enrollments";
import { createFilesGateway, FilesGateway } from "@/lib/data/files";
import { createLessonsGateway, LessonsGateway } from "@/lib/data/lessons";
import { createMessagesGateway, MessagesGateway } from "@/lib/data/messages";
import { createModulesGateway, ModulesGateway } from "@/lib/data/modules";
import { createNotificationsGateway, NotificationsGateway } from "@/lib/data/notifications";
import { createParentLinksGateway, ParentLinksGateway } from "@/lib/data/parentLinks";
import { createProfilesGateway, ProfilesGateway } from "@/lib/data/profiles";
import { createProgressGateway, ProgressGateway } from "@/lib/data/progress";
import { createProvidersGateway, ProvidersGateway } from "@/lib/data/providers";
import { createQuizzesGateway, QuizzesGateway } from "@/lib/data/quizzes";
import { createReportsGateway, ReportsGateway } from "@/lib/data/reports";
import { createSubmissionsGateway, SubmissionsGateway } from "@/lib/data/submissions";
import { createTeacherProgressGateway, TeacherProgressGateway } from "@/lib/data/teacherProgress";
import { createRuntimeGateway, RuntimeGateway } from "@/lib/data/runtime";
import { createGradingGateway, GradingGateway } from "@/lib/data/grading";
import { createRegistryGateway, RegistryGateway } from "@/lib/data/registry";

export type Sdk = {
  announcements: AnnouncementsGateway;
  assignments: AssignmentsGateway;
  courses: CoursesGateway;
  dashboard: DashboardGateway;
  enrollments: EnrollmentsGateway;
  files: FilesGateway;
  lessons: LessonsGateway;
  messages: MessagesGateway;
  modules: ModulesGateway;
  notifications: NotificationsGateway;
  parentLinks: ParentLinksGateway;
  profiles: ProfilesGateway;
  progress: ProgressGateway;
  providers: ProvidersGateway;
  quizzes: QuizzesGateway;
  reports: ReportsGateway;
  submissions: SubmissionsGateway;
  teacherProgress: TeacherProgressGateway;
  runtime: RuntimeGateway;
  grading: GradingGateway;
  registry: RegistryGateway;
};

export function createSdk(): Sdk {
  return {
    announcements: createAnnouncementsGateway(),
    assignments: createAssignmentsGateway(),
    courses: createCoursesGateway(),
    dashboard: createDashboardGateway(),
    enrollments: createEnrollmentsGateway(),
    files: createFilesGateway(),
    lessons: createLessonsGateway(),
    messages: createMessagesGateway(),
    modules: createModulesGateway(),
    notifications: createNotificationsGateway(),
    parentLinks: createParentLinksGateway(),
    profiles: createProfilesGateway(),
    progress: createProgressGateway(),
    providers: createProvidersGateway(),
    quizzes: createQuizzesGateway(),
    reports: createReportsGateway(),
    submissions: createSubmissionsGateway(),
    teacherProgress: createTeacherProgressGateway(),
    runtime: createRuntimeGateway(),
    grading: createGradingGateway(),
    registry: createRegistryGateway(),
  };
}

import { z } from "zod";

export async function fetchJson<T>(schema: z.ZodSchema<T>, url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...opts, headers: { ...(opts?.headers || {}) } });
  const requestId = res.headers.get("x-request-id") || undefined;
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Invalid JSON response${requestId ? ` (requestId=${requestId})` : ""}`);
  }
  const maybeError = (json as any)?.error as { code?: string; message?: string } | undefined;
  if (maybeError && typeof maybeError === "object") {
    const code = maybeError.code || "API_ERROR";
    const message = maybeError.message || code;
    const err = new Error(`${code}: ${message}${requestId ? ` (requestId=${requestId})` : ""}`);
    (err as any).code = code;
    (err as any).requestId = requestId;
    throw err;
  }
  const parsed = schema.parse(json);
  return parsed;
}


