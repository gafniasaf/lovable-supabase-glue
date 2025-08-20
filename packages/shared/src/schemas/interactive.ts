import { z } from "zod";

export const launchKind = z.enum(["WebEmbed", "RemoteContainer", "StreamedDesktop"]);
export type LaunchKind = z.infer<typeof launchKind>;

export const scope = z.enum([
  "progress.write",
  "progress.read",
  "attempts.write",
  "attempts.read",
  "files.read",
  "files.write",
]);
export type Scope = z.infer<typeof scope>;

export const courseProvider = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  jwks_url: z.string().url(),
  domain: z.string().min(1),
  created_at: z.string().optional(),
});
export type CourseProvider = z.infer<typeof courseProvider>;

export const launchTokenClaims = z.object({
  sub: z.string().uuid(),
  courseId: z.string().uuid(),
  role: z.enum(["student", "teacher", "parent", "admin"]),
  exp: z.number().int().positive(),
  iat: z.number().int().positive(),
  nonce: z.string().min(8),
  scopes: z.array(scope).default([]),
  callbackUrl: z.string().url(),
});
export type LaunchTokenClaims = z.infer<typeof launchTokenClaims>;

export const launchTokenResponse = z.object({ token: z.string().min(1), expiresAt: z.string() });
export type LaunchTokenResponse = z.infer<typeof launchTokenResponse>;

// Runtime → LMS events via postMessage
export const runtimeEvent = z.discriminatedUnion("type", [
  z.object({ type: z.literal("course.ready"), runtimeId: z.string().optional() }),
  z.object({ type: z.literal("course.progress"), pct: z.number().min(0).max(100), topic: z.string().optional() }),
  z.object({ type: z.literal("course.attempt.completed"), score: z.number().min(0), max: z.number().positive(), passed: z.boolean(), runtimeAttemptId: z.string().optional() }),
  z.object({ type: z.literal("course.error"), code: z.string().min(1), message: z.string().min(1) }),
]);
export type RuntimeEvent = z.infer<typeof runtimeEvent>;

// Provider → LMS outcome webhook
export const outcomeRequest = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
  event: z.discriminatedUnion("type", [
    z.object({ type: z.literal("attempt.completed"), score: z.number().min(0), max: z.number().positive(), passed: z.boolean(), runtimeAttemptId: z.string().optional(), raw: z.record(z.any()).optional() }),
    z.object({ type: z.literal("progress"), pct: z.number().min(0).max(100), topic: z.string().optional(), raw: z.record(z.any()).optional() }),
  ]),
});
export type OutcomeRequest = z.infer<typeof outcomeRequest>;

// Runtime v2 contracts (planned)
export const authExchangeRequest = z.object({ token: z.string().min(10) });
export const authExchangeResponse = z.object({ runtimeToken: z.string().min(10), expiresAt: z.string() });
export type AuthExchangeRequest = z.infer<typeof authExchangeRequest>;
export type AuthExchangeResponse = z.infer<typeof authExchangeResponse>;

export const contextResponse = z.object({
  alias: z.string().min(6),
  role: z.enum(["student", "teacher", "parent", "admin"]),
  courseId: z.string().uuid(),
  assignmentId: z.string().uuid().nullable().optional(),
  scopes: z.array(scope).default([]),
});
export type ContextResponse = z.infer<typeof contextResponse>;

export const progressUpsertRequest = z.object({ pct: z.number().min(0).max(100), topic: z.string().optional() });
export const gradeSubmitRequest = z.object({ score: z.number().min(0), max: z.number().positive(), passed: z.boolean(), runtimeAttemptId: z.string().optional() });
export type ProgressUpsertRequest = z.infer<typeof progressUpsertRequest>;
export type GradeSubmitRequest = z.infer<typeof gradeSubmitRequest>;

export const eventEmitRequest = z.object({ type: z.string().min(1), payload: z.record(z.any()).optional() });
export type EventEmitRequest = z.infer<typeof eventEmitRequest>;

export const checkpointSaveRequest = z.object({ key: z.string().min(1), state: z.record(z.any()) });
export const checkpointLoadRequest = z.object({ key: z.string().min(1) });
export type CheckpointSaveRequest = z.infer<typeof checkpointSaveRequest>;
export type CheckpointLoadRequest = z.infer<typeof checkpointLoadRequest>;

export const assetSignUrlRequest = z.object({ owner_type: z.enum(["runtime","assignment","submission"]).default("runtime"), owner_id: z.string().uuid().optional(), content_type: z.string().min(3), filename: z.string().optional() });
export type AssetSignUrlRequest = z.infer<typeof assetSignUrlRequest>;


