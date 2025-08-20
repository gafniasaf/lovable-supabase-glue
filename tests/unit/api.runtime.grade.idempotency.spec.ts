import { POST as GradePOST } from '../../apps/web/src/app/api/runtime/grade/route';

function base64url(input: Buffer | string) { const b = Buffer.isBuffer(input) ? input : Buffer.from(String(input)); return b.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }
function makeJwt(scopes: string[] = ['attempts.write']) {
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

function post(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('runtime grade idempotency', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret' } as any; delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY; });
  afterEach(() => { process.env = original; });

  test('duplicate grade request with same Idempotency-Key returns replayed 200', async () => {
    const token = makeJwt(['attempts.write']);
    const h = { authorization: `Bearer ${token}`, 'Idempotency-Key': 'grade-dup-1' } as Record<string,string>;
    let res = await (GradePOST as any)(post('http://localhost/api/runtime/grade', { score: 1, max: 1, passed: true }, h));
    expect([200,201,204]).toContain(res.status);
    res = await (GradePOST as any)(post('http://localhost/api/runtime/grade', { score: 1, max: 1, passed: true }, h));
    expect([200]).toContain(res.status);
    expect(res.headers.get('idempotency-replayed')).toBe('1');
  });
});


