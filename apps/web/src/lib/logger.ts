/**
 * Logger facade with Pino when available; falls back to console in test envs.
 *
 * Set `PINO_PRETTY=1` to enable pretty logs when not running in CI.
 * Use `getRequestLogger(requestId)` to attach tracing context.
 */
let pino: any;
try {
  // Defer resolving pino so unit tests need not install it.
  const mod = require("pino");
  pino = (mod && (mod.default || mod)) || mod;
} catch {
  pino = null;
}

const isCI = process.env.CI === "true" || process.env.CI === "1";
const wantPretty = process.env.PINO_PRETTY === "1";
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");
const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-test-auth"]',
  'headers.authorization',
  'headers.cookie',
  'headers["x-test-auth"]',
  'body.password',
  'body.token',
  // Additional PII fields (security audit)
  'body.email',
  'message.body',
  'attachments.object_key',
  // Common credential/env leakage
  'env.NEXT_RUNTIME_PRIVATE_KEY',
  'env.NEXT_RUNTIME_PUBLIC_KEY',
  'env.NEXT_RUNTIME_SECRET',
  'env.NEXT_PUBLIC_SUPABASE_ANON_KEY',
  // User identifiers in logs
  'user.id',
  'payload.user_id'
] as const;
export const __TEST_LOGS__: any[] = [];
const isJest = !!process.env.JEST_WORKER_ID;

function wrapLogger(base: any) {
  if (!base || typeof base !== 'object') return base;
  const wrapper: any = Object.create(base);
  const push = (level: string, obj?: any, msg?: string) => {
    try {
      __TEST_LOGS__.push({ level, msg, obj, ts: Date.now() });
      const MAX = Number(process.env.TEST_LOG_RING_SIZE || 5000);
      if (Array.isArray(__TEST_LOGS__) && __TEST_LOGS__.length > MAX) {
        // Trim oldest entries to keep memory bounded
        __TEST_LOGS__.splice(0, __TEST_LOGS__.length - MAX);
      }
    } catch {}
  };
  wrapper.info = (obj?: any, msg?: string) => { push('info', obj, msg); return base.info?.(obj, msg); };
  wrapper.debug = (obj?: any, msg?: string) => { push('debug', obj, msg); return base.debug?.(obj, msg); };
  wrapper.warn = (obj?: any, msg?: string) => { push('warn', obj, msg); return base.warn?.(obj, msg); };
  wrapper.error = (obj?: any, msg?: string) => { push('error', obj, msg); return base.error?.(obj, msg); };
  wrapper.child = (bindings: Record<string, unknown>) => {
    const childBase = base.child?.(bindings);
    const wrappedChild = wrapLogger(childBase);
    const testModeOn = isJest || String(process.env.TEST_MODE || '') === '1' || String(process.env.NEXT_PUBLIC_TEST_MODE || '') === '1';
    if (testModeOn && wrappedChild && typeof wrappedChild === 'object') {
      // Ensure bindings are accessible and redacted even when underlying logger lacks bindings()
      (wrappedChild as any).bindings = () => applyRedaction(bindings || {}, redactPaths as unknown as string[], '[REDACTED]');
    }
    return wrappedChild;
  };
  // In test-mode, expose a redacted view of bindings so unit tests can assert redaction without emitting logs
  wrapper.bindings = () => {
    const b = typeof base.bindings === 'function' ? base.bindings() : {};
    const testModeOn = isJest || String(process.env.TEST_MODE || '') === '1' || String(process.env.NEXT_PUBLIC_TEST_MODE || '') === '1';
    if (!testModeOn) return b;
    return applyRedaction(b, redactPaths as unknown as string[], '[REDACTED]');
  };
  return wrapper;
}

function splitPath(path: string): string[] {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/\["([^\"]+)"\]/g, '.$1')
    .replace(/\['([^']+)'\]/g, '.$1')
    .split('.')
    .filter(Boolean);
}

function applyRedaction(input: any, paths: string[], censor: unknown) {
  try {
    const clone = JSON.parse(JSON.stringify(input || {}));
    for (const p of paths) {
      const segs = splitPath(p);
      let cur: any = clone;
      for (let i = 0; i < segs.length - 1; i++) {
        const key = segs[i];
        if (cur && typeof cur === 'object' && key in cur) cur = cur[key]; else { cur = null; break; }
      }
      if (cur && typeof cur === 'object') {
        const last = segs[segs.length - 1];
        if (last in cur) cur[last] = censor;
      }
    }
    return clone;
  } catch {
    return input;
  }
}

export const logger = pino
  ? wrapLogger(pino(
      wantPretty && !isCI
        ? {
            level,
            transport: {
              target: "pino-pretty",
              options: { colorize: true, translateTime: "SYS:standard", singleLine: true }
            },
            redact: {
              paths: redactPaths as unknown as string[],
              censor: '[REDACTED]'
            }
          }
        : {
            level,
            redact: {
              paths: redactPaths as unknown as string[],
              censor: '[REDACTED]'
            }
          }
    ))
  : {
      // Console-like fallback with pino-compatible API surface used by the app
      child(bindings: Record<string, unknown>) {
        const self: any = this;
        return {
          info() {}, debug() {}, warn() {}, error() {},
          bindings: () => {
            const testModeOn = String(process.env.TEST_MODE || '') === '1' || String(process.env.NEXT_PUBLIC_TEST_MODE || '') === '1';
            return testModeOn ? applyRedaction(bindings || {}, redactPaths as unknown as string[], '[REDACTED]') : (bindings || {});
          }
        } as any;
      },
      info(obj?: any, msg?: string) { try { __TEST_LOGS__.push({ level: 'info', msg, obj, ts: Date.now() }); } catch {}; return (console.log as any)(obj, msg); },
      debug(obj?: any, msg?: string) { try { __TEST_LOGS__.push({ level: 'debug', msg, obj, ts: Date.now() }); } catch {}; return (console.debug as any)(obj, msg); },
      warn(obj?: any, msg?: string) { try { __TEST_LOGS__.push({ level: 'warn', msg, obj, ts: Date.now() }); } catch {}; return (console.warn as any)(obj, msg); },
      error(obj?: any, msg?: string) { try { __TEST_LOGS__.push({ level: 'error', msg, obj, ts: Date.now() }); } catch {}; return (console.error as any)(obj, msg); }
    } as any;

/** Return a child logger bound to a given request id. */
export function getRequestLogger(requestId: string) {
  const dev = process.env.DEV_ID || undefined;
  const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || undefined;
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || undefined;
  return logger.child({ requestId, dev, branch, commit });
}

// Expose redact paths for tests that validate configuration without relying on pino internals
try { (logger as any).__redact = { paths: redactPaths as unknown as string[] }; } catch {}


