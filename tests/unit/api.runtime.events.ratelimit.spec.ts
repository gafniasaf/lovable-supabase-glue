import { POST as EventsPOST } from '../../apps/web/src/app/api/runtime/events/route';

jest.mock('../../apps/web/src/lib/rateLimit', () => ({
  checkRateLimit: () => ({ allowed: false, remaining: 0, resetAt: Date.now() + 15_000 })
}), { virtual: true });

function base64url(input: Buffer | string) { const b = Buffer.isBuffer(input) ? input : Buffer.from(String(input)); return b.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }
function makeJwt(scopes: string[]) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now()/1000);
  const payload: any = { aud: 'https://provider.example', scopes, courseId: 'c1', alias: 'a1', iat: now, exp: now + 60 };
  const h64 = base64url(JSON.stringify(header));
  const p64 = base64url(JSON.stringify(payload));
  const data = `${h64}.${p64}`;
  const crypto = require('crypto');
  const sig = crypto.createHmac('sha256', 'dev-secret').update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return `${data}.${sig}`;
}

function post(body: any, headers?: Record<string,string>) {
  return new Request('http://localhost/api/runtime/events', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('runtime events rate-limit headers', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret' } as any; });
  afterEach(() => { process.env = original; });

  test('returns 429 with standard headers on rate limit', async () => {
    const token = makeJwt(['progress.write']);
    const res = await (EventsPOST as any)(post({ type: 'course.progress', pct: 10 }, { authorization: `Bearer ${token}` }));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
  });
});


