import { POST as GradePOST } from '../../apps/web/src/app/api/runtime/grade/route';

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

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/runtime/grade', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime grade rate-limit headers', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret', RUNTIME_GRADE_LIMIT: '1', RUNTIME_GRADE_WINDOW_MS: '60000' } as any; });
  afterEach(() => { process.env = original; });

  test('returns 201 first, then 429 with standard headers', async () => {
    const token = makeJwt(['attempts.write']);
    const h = { authorization: `Bearer ${token}` };
    let res = await (GradePOST as any)(post({ runtimeAttemptId: 'ra1', score: 1, max: 1, passed: true }, h));
    expect([200,201]).toContain(res.status);
    res = await (GradePOST as any)(post({ runtimeAttemptId: 'ra2', score: 1, max: 1, passed: true }, h));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


