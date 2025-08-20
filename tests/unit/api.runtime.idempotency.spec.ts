import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';

function post(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any, body: JSON.stringify({ pct: 10 }) } as any);
}

function base64url(input: Buffer | string) { const b = Buffer.isBuffer(input) ? input : Buffer.from(String(input)); return b.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }
function makeJwt(scopes: string[] = ['progress.write']) {
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

describe('runtime progress idempotency', () => {
  beforeEach(() => { (process.env as any).RUNTIME_API_V2 = '1'; (process.env as any).RUNTIME_CORS_ALLOW = 'https://provider.example'; (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret'; delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY; });

  test('duplicate request with same Idempotency-Key is replayed 200 with header', async () => {
    const token = makeJwt();
    const h = { authorization: `Bearer ${token}`, 'Idempotency-Key': 'dup-1' } as Record<string,string>;
    let res = await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', h));
    expect([200,201,204]).toContain(res.status);
    res = await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', h));
    expect([200]).toContain(res.status);
    expect(res.headers.get('idempotency-replayed')).toBe('1');
  });
});


