/**
 * Pino logger with optional pretty transport for local development.
 *
 * Set `PINO_PRETTY=1` to enable pretty logs when not running in CI.
 * Use `getRequestLogger(requestId)` to attach tracing context.
 */
// @ts-nocheck

import pino from "pino";

const isCI = process.env.CI === "true" || process.env.CI === "1";
const wantPretty = process.env.PINO_PRETTY === "1";
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");
export const logger = pino(
  wantPretty && !isCI
    ? {
        level,
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard", singleLine: true }
        },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers[\"x-test-auth\"]',
            'headers.authorization',
            'headers.cookie',
            'headers[\"x-test-auth\"]',
            'body.password',
            'body.token'
          ],
          censor: '[REDACTED]'
        }
      }
    : {
        level,
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers[\"x-test-auth\"]',
            'headers.authorization',
            'headers.cookie',
            'headers[\"x-test-auth\"]',
            'body.password',
            'body.token'
          ],
          censor: '[REDACTED]'
        }
      }
);

/** Return a child logger bound to a given request id. */
export function getRequestLogger(requestId: string) {
  const dev = process.env.DEV_ID || undefined;
  const branch = process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || undefined;
  const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || undefined;
  return logger.child({ requestId, dev, branch, commit });
}


