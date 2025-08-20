/**
 * Shared client-side env validation
 *
 * Use `loadClientEnv()` in browser-safe contexts to validate required public
 * environment variables for Supabase.
 */
import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10)
});

export type Env = z.infer<typeof envSchema>;

export function loadClientEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new Error(`Invalid environment: ${issues}`);
  }
  return parsed.data;
}

// Server-only env schema and loader
export const serverEnvSchema = envSchema.extend({
  DEV_ID: z.string().optional(),
  NEXT_RUNTIME_PUBLIC_KEY: z.string().optional(),
  NEXT_RUNTIME_PRIVATE_KEY: z.string().optional(),
  NEXT_RUNTIME_KEY_ID: z.string().optional(),
  NEXT_PUBLIC_CSP: z.string().optional(),
  RUNTIME_CORS_ALLOW: z.string().optional(),
  // Quotas / uploads
  STORAGE_QUOTA_ENABLED: z.string().optional(),
  UPLOAD_MAX_BYTES: z.string().optional(),
  RUNTIME_EVENTS_LIMIT: z.string().optional(),
  RUNTIME_EVENTS_WINDOW_MS: z.string().optional(),
  RUNTIME_OUTCOMES_LIMIT: z.string().optional(),
  RUNTIME_OUTCOMES_WINDOW_MS: z.string().optional(),
  GLOBAL_MUTATION_RATE_LIMIT: z.string().optional(),
  GLOBAL_MUTATION_RATE_WINDOW_MS: z.string().optional(),
  MVP_PROD_GUARD: z.string().optional(),
  TEST_MODE: z.string().optional(),
  CSRF_DOUBLE_SUBMIT: z.string().optional(),
  COEP: z.string().optional(),
  // Provider health
  PROVIDER_HEALTH_TTL_MS: z.string().optional(),
  PROVIDER_HEALTH_TIMEOUT_MS: z.string().optional(),
  PROVIDER_HEALTH_REFRESH_JOB: z.string().optional(),
  PROVIDER_HEALTH_REFRESH_INTERVAL_MS: z.string().optional(),
  // Quota reconcile job
  QUOTA_RECONCILE_JOB: z.string().optional(),
  QUOTA_RECONCILE_INTERVAL_MS: z.string().optional(),
  // Backfill sizes
  BACKFILL_ATTACHMENT_SIZES_JOB: z.string().optional(),
  BACKFILL_ATTACHMENT_SIZES_INTERVAL_MS: z.string().optional(),
  // Metrics token
  METRICS_TOKEN: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function loadServerEnv(): ServerEnv {
  const isJest = !!process.env.JEST_WORKER_ID;
  const isTestMode = process.env.TEST_MODE === '1' || process.env.NODE_ENV === 'test';
  const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || (isJest || isTestMode ? 'http://localhost:54321' : undefined);
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (isJest || isTestMode ? 'test-anon-key-1234567890' : undefined);
  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DEV_ID: process.env.DEV_ID,
    NEXT_RUNTIME_PUBLIC_KEY: process.env.NEXT_RUNTIME_PUBLIC_KEY,
    NEXT_RUNTIME_PRIVATE_KEY: process.env.NEXT_RUNTIME_PRIVATE_KEY,
    NEXT_RUNTIME_KEY_ID: process.env.NEXT_RUNTIME_KEY_ID,
    NEXT_PUBLIC_CSP: process.env.NEXT_PUBLIC_CSP,
    RUNTIME_CORS_ALLOW: process.env.RUNTIME_CORS_ALLOW,
    STORAGE_QUOTA_ENABLED: process.env.STORAGE_QUOTA_ENABLED,
    UPLOAD_MAX_BYTES: process.env.UPLOAD_MAX_BYTES,
    RUNTIME_EVENTS_LIMIT: process.env.RUNTIME_EVENTS_LIMIT,
    RUNTIME_EVENTS_WINDOW_MS: process.env.RUNTIME_EVENTS_WINDOW_MS,
    RUNTIME_OUTCOMES_LIMIT: process.env.RUNTIME_OUTCOMES_LIMIT,
    RUNTIME_OUTCOMES_WINDOW_MS: process.env.RUNTIME_OUTCOMES_WINDOW_MS,
    GLOBAL_MUTATION_RATE_LIMIT: process.env.GLOBAL_MUTATION_RATE_LIMIT,
    GLOBAL_MUTATION_RATE_WINDOW_MS: process.env.GLOBAL_MUTATION_RATE_WINDOW_MS,
    MVP_PROD_GUARD: process.env.MVP_PROD_GUARD,
    TEST_MODE: process.env.TEST_MODE,
    CSRF_DOUBLE_SUBMIT: process.env.CSRF_DOUBLE_SUBMIT,
    COEP: process.env.COEP,
    PROVIDER_HEALTH_TTL_MS: process.env.PROVIDER_HEALTH_TTL_MS,
    PROVIDER_HEALTH_TIMEOUT_MS: process.env.PROVIDER_HEALTH_TIMEOUT_MS,
    PROVIDER_HEALTH_REFRESH_JOB: process.env.PROVIDER_HEALTH_REFRESH_JOB,
    PROVIDER_HEALTH_REFRESH_INTERVAL_MS: process.env.PROVIDER_HEALTH_REFRESH_INTERVAL_MS,
    QUOTA_RECONCILE_JOB: process.env.QUOTA_RECONCILE_JOB,
    QUOTA_RECONCILE_INTERVAL_MS: process.env.QUOTA_RECONCILE_INTERVAL_MS,
    BACKFILL_ATTACHMENT_SIZES_JOB: process.env.BACKFILL_ATTACHMENT_SIZES_JOB,
    BACKFILL_ATTACHMENT_SIZES_INTERVAL_MS: process.env.BACKFILL_ATTACHMENT_SIZES_INTERVAL_MS,
    METRICS_TOKEN: process.env.METRICS_TOKEN,
    // Provider health limits
    PROVIDER_HEALTH_LIMIT: process.env.PROVIDER_HEALTH_LIMIT,
    PROVIDER_HEALTH_WINDOW_MS: process.env.PROVIDER_HEALTH_WINDOW_MS,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Invalid environment: ${issues}`);
  }
  const data = parsed.data as any;
  // Validate numeric envs when present
  const numericVars = [
    ['RUNTIME_EVENTS_LIMIT', data.RUNTIME_EVENTS_LIMIT],
    ['RUNTIME_EVENTS_WINDOW_MS', data.RUNTIME_EVENTS_WINDOW_MS],
    ['RUNTIME_OUTCOMES_LIMIT', data.RUNTIME_OUTCOMES_LIMIT],
    ['RUNTIME_OUTCOMES_WINDOW_MS', data.RUNTIME_OUTCOMES_WINDOW_MS],
    ['GLOBAL_MUTATION_RATE_LIMIT', data.GLOBAL_MUTATION_RATE_LIMIT],
    ['GLOBAL_MUTATION_RATE_WINDOW_MS', data.GLOBAL_MUTATION_RATE_WINDOW_MS],
    ['UPLOAD_MAX_BYTES', data.UPLOAD_MAX_BYTES],
    ['PROVIDER_HEALTH_TTL_MS', data.PROVIDER_HEALTH_TTL_MS],
    ['PROVIDER_HEALTH_TIMEOUT_MS', data.PROVIDER_HEALTH_TIMEOUT_MS],
    ['PROVIDER_HEALTH_REFRESH_INTERVAL_MS', data.PROVIDER_HEALTH_REFRESH_INTERVAL_MS],
    ['QUOTA_RECONCILE_INTERVAL_MS', data.QUOTA_RECONCILE_INTERVAL_MS],
    ['BACKFILL_ATTACHMENT_SIZES_INTERVAL_MS', data.BACKFILL_ATTACHMENT_SIZES_INTERVAL_MS],
    ['PROVIDER_HEALTH_LIMIT', data.PROVIDER_HEALTH_LIMIT],
    ['PROVIDER_HEALTH_WINDOW_MS', data.PROVIDER_HEALTH_WINDOW_MS],
  ] as const;
  for (const [name, val] of numericVars) {
    if (typeof val === 'string' && val.length > 0) {
      const n = Number(val);
      if (!Number.isFinite(n) || n < 0) {
        throw new Error(`Invalid environment: ${name} must be a non-negative number`);
      }
    }
  }
  // Validate RUNTIME_CORS_ALLOW origins
  if (data.RUNTIME_CORS_ALLOW) {
    const parts = String(data.RUNTIME_CORS_ALLOW).split(',').map((s: string) => s.trim()).filter(Boolean);
    for (const p of parts) {
      try {
        const u = new URL(p);
        if (!u.protocol.startsWith('http')) throw new Error('protocol');
      } catch {
        throw new Error(`Invalid environment: RUNTIME_CORS_ALLOW contains invalid origin: ${p}`);
      }
    }
  }
  // In prod with RUNTIME_API_V2=1, require RS256 keys
  if (process.env.NODE_ENV === 'production' && process.env.RUNTIME_API_V2 === '1') {
    if (!process.env.NEXT_RUNTIME_PUBLIC_KEY || !process.env.NEXT_RUNTIME_PRIVATE_KEY || !process.env.NEXT_RUNTIME_KEY_ID) {
      throw new Error('Invalid environment: Runtime v2 requires NEXT_RUNTIME_PUBLIC_KEY, NEXT_RUNTIME_PRIVATE_KEY, NEXT_RUNTIME_KEY_ID in production');
    }
  }
  // In production, fail fast if TEST_MODE is set, except when explicitly allowed for E2E
  if (process.env.NODE_ENV === 'production') {
    const testModeOn = String(process.env.TEST_MODE || '') === '1';
    const e2eAllowed = String(process.env.NEXT_PUBLIC_TEST_MODE || '') === '1' ||
      String(process.env.E2E_ALLOW_TEST_MODE || '') === '1' ||
      !!process.env.PLAYWRIGHT;
    if (testModeOn && !e2eAllowed) {
      throw new Error('Invalid environment: TEST_MODE must not be enabled in production');
    }
  }
  return data;
}

