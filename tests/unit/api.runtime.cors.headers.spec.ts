import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';

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

const post = (headers?: Record<string,string>) => new Request('http://localhost/api/runtime/progress', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any, body: JSON.stringify({ pct: 10 }) } as any);

describe('runtime CORS headers for allowed origin', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret' } as any; });
  afterEach(() => { process.env = original; });

  test('includes access-control-allow-origin when origin is allowed', async () => {
    const token = makeJwt(['progress.write']);
    const res = await (ProgressPOST as any)(post({ authorization: `Bearer ${token}` }));
    // success or preflight OK
    expect([200,201,204,400]).toContain(res.status);
    // @ts-ignore NextResponse-like headers
    const h = res.headers as Headers;
    expect(h.get('access-control-allow-origin')).toBe('https://provider.example');
  });
});


