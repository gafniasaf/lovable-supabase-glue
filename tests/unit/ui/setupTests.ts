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


