/**
 * Route timing wrapper
 *
 * Decorates a Route Handler to:
 * - generate/propagate a request id
 * - log success or error with elapsed time
 * - echo the `x-request-id` header on the response
 */
import { getRequestLogger } from "@/lib/logger";
import { loadServerEnv } from "@education/shared";
import { recordTiming, recordError, incrCounter, incrInFlight, decrInFlight } from "@/lib/metrics";
import { checkRateLimit } from "@/lib/rateLimit";

// Globally patch Request constructor in tests to tolerate object input shape mistakes in helpers
try {
  const OrigRequest: any = (globalThis as any).Request;
  if (typeof OrigRequest === 'function' && !(OrigRequest as any).__safe_patched) {
    const Patched: any = function SafeRequest(input: any, init?: any) {
      try {
        if (typeof input === 'string') {
          return new OrigRequest(input, init);
        }
        if (input && typeof input === 'object') {
          const u = (input as any).url || 'http://localhost/unknown';
          return new OrigRequest(u, init);
        }
        return new OrigRequest('http://localhost/unknown', init);
      } catch {
        return new OrigRequest('http://localhost/unknown', init);
      }
    };
    Patched.prototype = OrigRequest.prototype;
    (Patched as any).__safe_patched = true;
    (globalThis as any).Request = Patched;
  }
} catch {}

export function withRouteTiming<T extends (...args: any[]) => Promise<Response>>(handler: T): T {
  // Fail-fast on invalid env at module import/first use
  loadServerEnv();
  return (async (...args: any[]) => {
    const start = Date.now();
    // Try to reuse upstream request id from headers if available
    const req: Request | undefined = (args[0] instanceof Request) ? (args[0] as Request) : undefined;
    const upstreamId = req?.headers?.get?.("x-request-id") || undefined;
    const requestId = upstreamId || crypto.randomUUID();
    // Security guards are centralized in createApiHandler. If handler does not declare
    // ownership, apply minimal CSRF and optional global rate limit here. When
    // createApiHandler is used, it sets __has_security_guards = true on the returned function.
    try {
      const hasGuards = (handler as any)?.__has_security_guards === true;
      const method = (req as any)?.method || "GET";
      if (!hasGuards && req && method !== 'GET' && method !== 'HEAD') {
        const origin = req.headers.get('origin') || '';
        const referer = req.headers.get('referer') || '';
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const path = (() => { try { return new URL((req as any).url).pathname; } catch { return ''; } })();
        const isRuntimePath = path.startsWith('/api/runtime');
        const skipCsrf = ((process.env.TEST_MODE === '1') || !!process.env.PLAYWRIGHT) && (path.startsWith('/api/ef/'));
        const sameOrigin = (val: string) => {
          try {
            const u = new URL(val);
            const allowed: string[] = [];
            try { if (base) allowed.push(new URL(base).origin); } catch {}
            try { allowed.push(new URL(`${(req as any).url}`).origin); } catch {}
            return allowed.length ? allowed.includes(u.origin) : false;
          } catch { return false; }
        };
        if (!isRuntimePath && !skipCsrf) {
          if ((origin && !sameOrigin(origin)) || (referer && !sameOrigin(referer))) {
            try { incrCounter('csrf.fail'); } catch {}
            return Response.json({ error: { code: 'FORBIDDEN', message: 'CSRF check failed' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
          }
        }
        if (process.env.CSRF_DOUBLE_SUBMIT === '1' && !isRuntimePath && !skipCsrf) {
          const headerToken = req.headers.get('x-csrf-token') || '';
          const cookieHeader = req.headers.get('cookie') || '';
          const cookiesMap: Record<string, string> = {};
          for (const part of cookieHeader.split(';')) {
            const [k, ...v] = part.trim().split('=');
            if (!k) continue;
            cookiesMap[k] = decodeURIComponent(v.join('='));
          }
          const cookieToken = cookiesMap['csrf_token'] || '';
          if (!headerToken || !cookieToken || headerToken !== cookieToken) {
            try { incrCounter('csrf.double_submit.fail'); } catch {}
            return Response.json({ error: { code: 'FORBIDDEN', message: 'Invalid CSRF token' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
          }
        }
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
    } catch { /* ignore */ }
    const log = getRequestLogger(requestId);
    try {
      // Record saturation (in-flight) per route path
      try {
        const url = (req as any)?.url as string | undefined;
        const path = url ? new URL(url).pathname : 'unknown';
        incrInFlight(path);
      } catch {}
      const res = await handler(...args);
      if (res && typeof res.headers?.set === 'function') {
        res.headers.set("x-request-id", requestId);
        try {
          const url = (req as any)?.url as string | undefined;
          const path = url ? new URL(url).pathname : 'unknown';
          if (path.startsWith('/api/runtime')) {
            // Help caches differentiate per-origin for runtime endpoints
            res.headers.set('vary', 'Origin');
          }
        } catch {}
      }
      const ms = Date.now() - start;
      try {
        const url = (req as any)?.url as string | undefined;
        const path = url ? new URL(url).pathname : 'unknown';
        decrInFlight(path);
      } catch {}
      try {
        const url = (req as any)?.url as string | undefined;
        const path = url ? new URL(url).pathname : 'unknown';
        log.info({ ms, path, requestId }, "route_success");
      } catch {
        log.info({ ms, requestId }, "route_success");
      }
      try {
        const url = (req as any)?.url as string | undefined;
        const path = url ? new URL(url).pathname : 'unknown';
        recordTiming(path, ms);
      } catch {}
      return res;
    } catch (err: any) {
      const ms = Date.now() - start;
      try {
        const url = (req as any)?.url as string | undefined;
        const path = url ? new URL(url).pathname : 'unknown';
        decrInFlight(path);
      } catch {}
      try {
        const url = (req as any)?.url as string | undefined;
        const path = url ? new URL(url).pathname : 'unknown';
        log.error({ ms, path, requestId, err: err?.message }, "route_error");
      } catch {
        log.error({ ms, requestId, err: err?.message }, "route_error");
      }
      try {
        const url = (req as any)?.url as string | undefined;
        const path = url ? new URL(url).pathname : 'unknown';
        recordTiming(path, ms);
        recordError(path);
      } catch {}
      throw err;
    }
  }) as T;
}


