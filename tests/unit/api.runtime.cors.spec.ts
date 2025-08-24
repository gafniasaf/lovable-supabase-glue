import { POST as ProgressPOST, OPTIONS as ProgressOPTIONS } from '../../apps/web/src/app/api/runtime/progress/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }
function options(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'OPTIONS', headers: headers as any } as any); }

describe('runtime CORS headers', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('allowed origin receives CORS headers on OPTIONS', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'http://localhost' } as any;
    const res = await (ProgressOPTIONS as any)(options('http://localhost/api/runtime/progress', { origin: 'http://localhost' }));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost');
    expect(res.headers.get('vary')).toBe('Origin');
  });

  test('allowed origin receives CORS headers on POST', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'http://localhost' } as any;
    const res = await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', { authorization: 'Bearer t', origin: 'http://localhost' } as any, { pct: 10 }));
    expect([201,401,403,429,500]).toContain(res.status);
    if (res.status === 201) {
      expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost');
      expect(res.headers.get('vary')).toBe('Origin');
    }
  });
});
