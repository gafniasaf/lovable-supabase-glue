// Minimal MSW shim that intercepts global fetch for tests
type Resolver = (req: Request) => Promise<Response> | Response;
const routes: { method: string; path: string; resolver: Resolver }[] = [];

function normalizePath(input: string): string {
  try {
    const u = new URL(input);
    return u.pathname;
  } catch {
    return input;
  }
}

export const http: any = {
  get: (path: string, resolver: Resolver) => ({ method: 'GET', path, resolver }),
  post: (path: string, resolver: Resolver) => ({ method: 'POST', path, resolver }),
  patch: (path: string, resolver: Resolver) => ({ method: 'PATCH', path, resolver })
};

export const HttpResponse: any = {
  json: (data: any, init?: any) => new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' }, ...(init || {}) })
};

function installFetchInterceptor() {
  const g: any = globalThis as any;
  const originalFetch: typeof fetch | undefined = g.fetch;
  // Ensure fetch/Response exist
  try {
    if (typeof g.fetch !== 'function') {
      const u = require('undici');
      g.fetch = u.fetch;
      g.Headers = g.Headers || u.Headers;
      g.Request = g.Request || u.Request;
      g.Response = g.Response || u.Response;
    }
  } catch {}
  class SimpleResponse {
    body: any; status: number; headers: any; ok: boolean;
    constructor(body: any, init?: any) {
      this.body = body; this.status = init?.status || 200;
      this.headers = new Map(Object.entries(init?.headers || {}));
      this.ok = this.status >= 200 && this.status < 300;
    }
    async json() { try { return JSON.parse(this.body); } catch { return this.body; } }
    async text() { return String(this.body); }
  }
  g.__MSW_ORIGINAL_FETCH__ = originalFetch;
  g.fetch = async (input: any, init?: RequestInit) => {
    try {
      const url = typeof input === 'string' ? input : (input?.url ?? String(input));
      const method = String(init?.method || (typeof input !== 'string' ? input?.method : 'GET') || 'GET').toUpperCase();
      const path = normalizePath(url);
      const hit = routes.find(r => r.method === method && r.path === path);
      if (hit) {
        const req = typeof input === 'string' ? new Request(url, init) : (input as Request);
        return await hit.resolver(req);
      }
    } catch {}
    if (typeof originalFetch === 'function') return originalFetch(input as any, init);
    let Resp: any = (g as any).Response;
    if (typeof Resp !== 'function') Resp = SimpleResponse as any;
    return new Resp(JSON.stringify({ ok: false }), { status: 404, headers: { 'content-type': 'application/json' } });
  };
}

export function setupServer() {
  return {
    listen: (_opts?: any) => { installFetchInterceptor(); },
    use: (...defs: any[]) => {
      for (const d of defs) {
        if (d && typeof d === 'object' && 'method' in d && 'path' in d && 'resolver' in d) {
          routes.push(d as any);
        }
      }
    },
    resetHandlers: () => { routes.length = 0; },
    close: () => { const g: any = globalThis as any; if (g.__MSW_ORIGINAL_FETCH__) g.fetch = g.__MSW_ORIGINAL_FETCH__; }
  } as any;
}


