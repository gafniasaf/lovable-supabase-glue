const store = (globalThis as any).__TEST_HEADERS_STORE__ || { cookies: new Map<string, string>(), headers: new Map<string, string>() };
export function headers() {
  return { get: (k: string) => store.headers.get(k) || null } as any;
}
export function cookies() {
  return {
    get: (k: string) => {
      const v = store.cookies.get(k);
      return v ? { name: k, value: v } : undefined;
    },
    getAll: () => Array.from(store.cookies.entries()).map(([name, value]) => ({ name, value }))
  } as any;
}

