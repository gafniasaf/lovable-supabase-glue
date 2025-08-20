/**
 * Server-side fetch utilities.
 *
 * Ensures requests from server components and route handlers:
 * - propagate `x-request-id` for traceability
 * - propagate `x-test-auth` when running in test mode
 * - automatically resolve base URL from env or localhost
 *
 * This module is also imported by client bundles via gateway files. To avoid
 * bundling Next.js server-only modules (next/headers) into client code, we
 * access them via a guarded require at runtime only when executing on the server.
 */
// @ts-nocheck

import { z } from "zod";

/** Resolve the base URL for server-originating requests. */
export function getBaseUrl() {
  return process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
}

/**
 * Fetch wrapper that adds tracing and test headers.
 *
 * - path: absolute URL or path starting with '/'
 * - init: optional RequestInit
 */
export async function serverFetch(path: string, init?: RequestInit) {
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path}`;
  const hdrs = new Headers(init?.headers || {});
  try {
    if (typeof window === 'undefined') {
      // Server runtime: read incoming headers/cookies via next/headers
      // Use guarded require to keep client bundle free of next/headers
      const nh: any = require('next/headers');
      const h = nh.headers();
      const upstreamId = h.get("x-request-id") || undefined;
      const ck = nh.cookies?.();
      const testAuth = ck?.get?.("x-test-auth")?.value || h.get("x-test-auth") || undefined;
      if (upstreamId && !hdrs.has("x-request-id")) hdrs.set("x-request-id", upstreamId);
      if (testAuth && !hdrs.has("x-test-auth")) hdrs.set("x-test-auth", String(testAuth));
      // Attach CSRF token for unsafe methods when double-submit is enabled
      const method = String((init?.method || 'GET')).toUpperCase();
      if (process.env.CSRF_DOUBLE_SUBMIT === '1' && method !== 'GET' && method !== 'HEAD') {
        const csrf = ck?.get?.('csrf_token')?.value || '';
        if (csrf && !hdrs.has('x-csrf-token')) hdrs.set('x-csrf-token', csrf);
      }
    } else {
      // Client runtime: optionally propagate x-test-auth from document.cookie
      try {
        const cookie = typeof document !== 'undefined' ? document.cookie || '' : '';
        const parts = cookie.split(';');
        for (const p of parts) {
          const [k, ...v] = p.trim().split('=');
          if (k === 'x-test-auth') {
            const val = decodeURIComponent(v.join('='));
            if (val && !hdrs.has('x-test-auth')) hdrs.set('x-test-auth', val);
          }
          if (k === 'csrf_token') {
            const val = decodeURIComponent(v.join('='));
            const method = String((init?.method || 'GET')).toUpperCase();
            if (process.env.CSRF_DOUBLE_SUBMIT === '1' && method !== 'GET' && method !== 'HEAD') {
              if (val && !hdrs.has('x-csrf-token')) hdrs.set('x-csrf-token', val);
            }
          }
        }
      } catch {}
    }
  } catch {}
  // Lightweight request timing in test mode
  const isTest = process.env.TEST_MODE === '1' || process.env.PLAYWRIGHT;
  if (!isTest) {
    return fetch(url, { cache: "no-store", ...init, headers: hdrs });
  }
  const started = Date.now();
  const res = await fetch(url, { cache: "no-store", ...init, headers: hdrs });
  try {
    const ms = Date.now() - started;
    // eslint-disable-next-line no-console
    console.debug(`[serverFetch] ${res.status} ${url} ${ms}ms`);
  } catch {}
  return res;
}

/**
 * Fetch JSON and validate with a Zod schema. Throws when response is non-OK
 * or when the JSON shape does not match the schema.
 */
export async function fetchJson<T>(path: string, schema: z.ZodTypeAny, init?: RequestInit): Promise<T> {
  const res = await serverFetch(path, init);
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new Error(`Invalid JSON response (${res.status})`);
  }
  if (!res.ok) {
    // Allow callers to catch typed errors while keeping schema validation strict.
    const message = (json as any)?.error?.message || `HTTP ${res.status}`;
    const code = (json as any)?.error?.code || 'HTTP_ERROR';
    throw new Error(`${code}: ${message}`);
  }
  return schema.parse(json) as T;
}


