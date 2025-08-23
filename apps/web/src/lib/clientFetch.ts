/**
 * Client-side fetch wrapper mirroring `serverFetch` behavior.
 * - Resolves base URL from window.location.origin
 * - Propagates x-test-auth from document.cookie in TEST_MODE
 */
export async function clientFetch(path: string, init?: RequestInit) {
  const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
  const url = path.startsWith('http') ? path : `${origin}${path}`;
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


