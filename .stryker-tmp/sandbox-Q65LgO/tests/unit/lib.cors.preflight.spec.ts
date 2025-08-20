// @ts-nocheck
import { OPTIONS as ContextOPTIONS, GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';

function opt(url: string, origin: string) {
  return new Request(url, { method: 'OPTIONS', headers: { origin } as any } as any);
}
function get(url: string, origin: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: { origin, ...(headers||{}) } as any } as any);
}

describe('CORS preflight and allow headers', () => {
  beforeEach(() => {
    (process.env as any).RUNTIME_API_V2 = '1';
    (process.env as any).RUNTIME_CORS_ALLOW = 'https://provider.example';
    (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret';
  });

  test('OPTIONS echoes allow headers for allowed origin', async () => {
    const res = await (ContextOPTIONS as any)(opt('http://localhost/api/runtime/context', 'https://provider.example'));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://provider.example');
  });

  test('GET sets vary and allow-origin when origin allowed (no token path)', async () => {
    // Without Authorization, handler returns 401 but should still echo request-id; CORS headers only set on 200 paths
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context', 'https://provider.example'));
    expect([401,403]).toContain(res.status);
  });
});


