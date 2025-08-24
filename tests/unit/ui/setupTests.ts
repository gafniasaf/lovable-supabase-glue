import '@testing-library/jest-dom';
// JSDOM lacks crypto.randomUUID; provide a simple polyfill for tests using Toast
if (!(global as any).crypto) {
  (global as any).crypto = { randomUUID: () => `t-${Math.random().toString(16).slice(2)}` } as any;
}

// Provide default test-mode headers/cookies for pages that read next/headers
// @ts-ignore
(global as any).__TEST_HEADERS_STORE__ = (global as any).__TEST_HEADERS_STORE__ || { cookies: new Map(), headers: new Map() };
// @ts-ignore
(global as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
process.env.TEST_MODE = process.env.TEST_MODE || '1';
process.env.NEXT_PUBLIC_TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE || '1';
process.env.PLAYWRIGHT_BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3022';

// Ensure fetch is available in jsdom tests. If Node provides global fetch, mirror it onto window.
try {
  const g: any = globalThis as any;
  if (typeof g.fetch !== 'function') {
    try {
      const undici = require('undici');
      g.fetch = undici.fetch;
      g.Headers = undici.Headers;
      g.Request = undici.Request;
      g.Response = undici.Response;
    } catch {}
  }
  if (g.window) {
    if (typeof g.window.fetch !== 'function' && typeof g.fetch === 'function') g.window.fetch = g.fetch;
    if (!g.window.Headers && g.Headers) g.window.Headers = g.Headers;
    if (!g.window.Request && g.Request) g.window.Request = g.Request;
    if (!g.window.Response && g.Response) g.window.Response = g.Response;
  }
} catch {}


