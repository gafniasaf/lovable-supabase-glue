function getStore() {
  const raw: any = (globalThis as any).__TEST_HEADERS_STORE__;
  const init = { cookies: new Map<string, string>(), headers: new Map<string, string>() };
  if (!raw || typeof raw !== 'object') return init;
  const out: any = raw;
  if (!out.cookies || typeof out.cookies.get !== 'function') out.cookies = new Map<string, string>();
  if (!out.headers || typeof out.headers.get !== 'function') out.headers = new Map<string, string>();
  return out;
}

export function headers() {
  const s = getStore();
  return { get: (k: string) => s.headers.get(k) || null } as any;
}
export function cookies() {
  const s = getStore();
  return {
    get: (k: string) => {
      const v = s.cookies.get(k);
      return v ? { name: k, value: v } : undefined;
    },
    getAll: () => Array.from(s.cookies.entries()).map(([name, value]) => ({ name, value }))
  } as any;
}

