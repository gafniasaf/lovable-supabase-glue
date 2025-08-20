import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';

function post(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any, body: JSON.stringify({ pct: 10 }) } as any);
}

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeJwt(scopes: string[] = ['progress.write']) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: any = { aud: 'https://provider.example', scopes, courseId: 'c1', alias: 'a1', iat: now, exp: now + 60 };
  const h64 = base64url(JSON.stringify(header));
  const p64 = base64url(JSON.stringify(payload));
  const data = `${h64}.${p64}`;
  const crypto = require('crypto');
  const sig = crypto.createHmac('sha256', 'dev-secret').update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

describe('runtime v2 per-endpoint rate limiting', () => {
  beforeEach(() => {
    (process.env as any).RUNTIME_API_V2 = '1';
    (process.env as any).RUNTIME_CORS_ALLOW = 'https://provider.example';
    (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret';
    delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY;
  });

  test('progress POST returns 429 with headers after exceeding limit (env-driven)', async () => {
    // Simulate a very small window limit via existing global mutation limiter
    (process.env as any).GLOBAL_MUTATION_RATE_LIMIT = '1';
    (process.env as any).GLOBAL_MUTATION_RATE_WINDOW_MS = '60000';
    const token = makeJwt(['progress.write']);
    const h = { authorization: `Bearer ${token}` } as Record<string,string>;
    await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', h));
    const res = await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', h));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


