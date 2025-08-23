/**
 * API handler factory
 *
 * Wraps Next.js Route Handler functions with:
 * - optional Zod validation for JSON body
 * - consistent request id propagation via `x-request-id`
 * - structured error responses for validation and internal errors
 */
import { z, ZodError } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { incrCounter } from "@/lib/metrics";

type ApiHandlerContext = { requestId: string; req: Request; headers: Headers };

export function createApiHandler<I extends z.ZodTypeAny>(opts: {
  schema?: I;
  /** Optional pre-auth/pre-validation hook. Return a Response to short-circuit. */
  preAuth?: (ctx: ApiHandlerContext) => Promise<Response | null>;
  handler: (input: I extends z.ZodTypeAny ? z.infer<I> : undefined, ctx: ApiHandlerContext) => Promise<Response>;
}) {
  /** Route Handler compatible function that parses, validates, and delegates. */
  const wrapped = async (req: Request) => {
    const upstreamId = req.headers.get("x-request-id") || undefined;
    const requestId = upstreamId || crypto.randomUUID();
    try {
      // Basic CSRF: validate Origin/Referer on non-GET/HEAD
      const method = (req as any).method || "GET";
      if (method !== 'GET' && method !== 'HEAD') {
        const origin = req.headers.get('origin') || '';
        const referer = req.headers.get('referer') || '';
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const allowed = (() => {
          const arr: string[] = [];
          try { if (base) arr.push(new URL(base).origin); } catch {}
          try { arr.push(new URL(`${req.url}`).origin); } catch {}
          return Array.from(new Set(arr));
        })();
        const pathname = (() => { try { return new URL(`${req.url}`).pathname; } catch { return ''; } })();
        const isRuntimePath = pathname.startsWith('/api/runtime');
        const skipEfCsrf = ((process.env.TEST_MODE === '1') || !!(process as any)?.env?.JEST_WORKER_ID) && pathname.startsWith('/api/ef/');
        const sameOrigin = (val: string) => {
          try { const u = new URL(val); return allowed.length ? allowed.includes(u.origin) : (u.origin === (new URL(`${req.url}`)).origin); } catch { return false; }
        };
        if (!isRuntimePath && !skipEfCsrf) {
          if ((origin && !sameOrigin(origin)) || (referer && !sameOrigin(referer))) {
            try { incrCounter('csrf.fail'); } catch {}
            return Response.json({ error: { code: 'FORBIDDEN', message: 'CSRF check failed' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
          }
        }
        // Optional double-submit CSRF token for sensitive mutations (skip runtime endpoints)
        const wantDoubleSubmit = process.env.CSRF_DOUBLE_SUBMIT === '1';
        if (wantDoubleSubmit && !isRuntimePath && !skipEfCsrf) {
          const cookieHeader = req.headers.get('cookie') || '';
          const cookiesMap: Record<string, string> = {};
          for (const part of cookieHeader.split(';')) {
            const [k, ...v] = part.trim().split('=');
            if (!k) continue;
            cookiesMap[k] = decodeURIComponent(v.join('='));
          }
          const cookieToken = cookiesMap['csrf_token'] || '';
          const headerToken = req.headers.get('x-csrf-token') || '';
          if (!cookieToken || !headerToken || cookieToken !== headerToken) {
            try { incrCounter('csrf.double_submit.fail'); } catch {}
            return Response.json({ error: { code: 'FORBIDDEN', message: 'CSRF token mismatch' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
          }
        }
        // Optional global per-IP mutation rate limit
        const limit = Number(process.env.GLOBAL_MUTATION_RATE_LIMIT || 0);
        if (limit > 0) {
          const windowMs = Number(process.env.GLOBAL_MUTATION_RATE_WINDOW_MS || 60000);
          const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
          const rl = checkRateLimit(`ip:${ip}`, limit, windowMs);
          if (!rl.allowed) {
            try { incrCounter('rate_limit.hit'); } catch {}
            const retryMs = Math.max(0, rl.resetAt - Date.now());
            const headers: Record<string, string> = {
              'x-request-id': requestId,
              'retry-after': String(Math.ceil(retryMs / 1000)),
              'x-rate-limit-remaining': String(rl.remaining),
              'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000))
            };
            return Response.json({ error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId }, { status: 429, headers });
          }
        }
      }
      const ctx = { requestId, req, headers: req.headers } as ApiHandlerContext;
      // Allow routes to perform auth checks before we validate the payload
      if (opts.preAuth) {
        const early = await opts.preAuth(ctx);
        if (early) {
          if (typeof early.headers?.set === 'function') early.headers.set('x-request-id', requestId);
          return early;
        }
      }
      let json: unknown = undefined;
      if (opts.schema) {
        // Parse JSON safely; return 400 on invalid JSON instead of 500
        const raw = await req.text();
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch {
          return Response.json({ error: { code: 'BAD_REQUEST', message: 'Invalid JSON' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
        }
      }
      const input = (opts.schema ? opts.schema.parse(json) : undefined) as any;
      const res = await opts.handler(input, ctx);
      if (res && typeof res.headers?.set === 'function') {
        res.headers.set("x-request-id", requestId);
      }
      return res;
    } catch (err: any) {
      if (err instanceof ZodError) {
        return Response.json({ error: { code: "BAD_REQUEST", message: err.message }, requestId }, { status: 400, headers: { "x-request-id": requestId } });
      }
      return Response.json({ error: { code: "INTERNAL", message: err?.message ?? "Unexpected error" }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
    }
  };
  // Mark returned handler as owning security guards (CSRF, global IP rate-limit)
  (wrapped as any).__has_security_guards = true;
  return wrapped;
}


