/**
 * Client-side fetch wrapper mirroring `serverFetch` behavior.
 * - Resolves base URL from NEXT_PUBLIC_BASE_URL
 * - Propagates x-test-auth from document.cookie in TEST_MODE
 */
// @ts-nocheck

export async function clientFetch(path: string, init?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = path.startsWith('http') ? path : `${base}${path}`;
  const headers = new Headers(init?.headers || {});
  try {
    const cookie = typeof document !== 'undefined' ? document.cookie || '' : '';
    const parts = cookie.split(';');
    for (const p of parts) {
      const [k, ...v] = p.trim().split('=');
      if (k === 'x-test-auth') {
        const val = decodeURIComponent(v.join('='));
        if (val && !headers.has('x-test-auth')) headers.set('x-test-auth', val);
        break;
      }
    }
  } catch {}
  return fetch(url, { cache: 'no-store', ...init, headers });
}


