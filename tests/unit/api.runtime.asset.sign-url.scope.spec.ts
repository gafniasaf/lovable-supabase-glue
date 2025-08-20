import { POST as AssetSignPOST } from '../../apps/web/src/app/api/runtime/asset/sign-url/route';

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

function post(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('runtime asset sign-url scope', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret' } as any; delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY; });
  afterEach(() => { process.env = original; });

  test('missing files.write scope → 403', async () => {
    const token = makeJwt([]);
    const res = await (AssetSignPOST as any)(post('http://localhost/api/runtime/asset/sign-url', { content_type: 'image/png' }, { authorization: `Bearer ${token}` }));
    expect(res.status).toBe(403);
  });

  test('valid scope and content-type → 200 with url/key', async () => {
    const token = makeJwt(['files.write']);
    const res = await (AssetSignPOST as any)(post('http://localhost/api/runtime/asset/sign-url', { content_type: 'image/png' }, { authorization: `Bearer ${token}` }));
    expect([200]).toContain(res.status);
    const json = await res.json();
    expect(json.url).toBeTruthy();
    expect(json.key).toMatch(/runtime\//);
  });

  test('unsupported content type → 400', async () => {
    const token = makeJwt(['files.write']);
    const res = await (AssetSignPOST as any)(post('http://localhost/api/runtime/asset/sign-url', { content_type: 'application/x-foo' }, { authorization: `Bearer ${token}` }));
    expect(res.status).toBe(400);
  });
});


