import { z } from "zod";

export const externalCourse = z.object({
  id: z.string().uuid(),
  vendor_id: z.string().uuid().nullable().optional(),
  kind: z.enum(["v1", "v2"]),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  version: z.string().min(1),
  status: z.enum(["draft", "approved", "disabled"]).default("draft"),
  launch_url: z.string().url().nullable().optional(),
  bundle_ref: z.string().nullable().optional(),
  scopes: z.array(z.string()).nullable().optional(),
  created_at: z.string().optional(),
});
export type ExternalCourse = z.infer<typeof externalCourse>;

export const courseVersion = z.object({
  id: z.string().uuid(),
  external_course_id: z.string().uuid(),
  version: z.string().min(1),
  status: z.enum(["draft", "approved", "disabled"]).default("approved"),
  manifest_hash: z.string().nullable().optional(),
  launch_url: z.string().url().nullable().optional(),
  created_at: z.string().optional(),
  released_at: z.string().nullable().optional(),
  rolled_back_from: z.string().uuid().nullable().optional(),
});
export type CourseVersion = z.infer<typeof courseVersion>;

export const attemptRules = z.object({
  max_attempts: z.number().int().min(1).max(20).nullable().optional(),
  time_limit_sec: z.number().int().min(30).max(24 * 3600).nullable().optional(),
  late_policy: z.enum(["allow", "block", "penalize"]).default("allow"),
});
export type AttemptRules = z.infer<typeof attemptRules>;

export const gradingPolicy = z.object({
  points: z.number().int().min(0).max(1000).default(100),
  pass_pct: z.number().min(0).max(100).nullable().optional(),
  rubric_url: z.string().url().nullable().optional(),
});
export type GradingPolicy = z.infer<typeof gradingPolicy>;

export const assignmentTarget = z.object({
  assignment_id: z.string().uuid(),
  source: z.enum(["native", "v1", "v2"]),
  external_course_id: z.string().uuid().nullable().optional(),
  version_id: z.string().uuid().nullable().optional(),
  lesson_slug: z.string().nullable().optional(),
  launch_url: z.string().url().nullable().optional(),
  attempt_rules: attemptRules.default({ late_policy: "allow" }),
  grading_policy: gradingPolicy.default({ points: 100 }),
});
export type AssignmentTarget = z.infer<typeof assignmentTarget>;

// Requests for API endpoints
export const assignmentTargetUpsertRequest = assignmentTarget.pick({
  assignment_id: true,
  source: true,
  external_course_id: true,
  version_id: true,
  lesson_slug: true,
  launch_url: true,
  attempt_rules: true,
  grading_policy: true,
});
export type AssignmentTargetUpsertRequest = z.infer<typeof assignmentTargetUpsertRequest>;


