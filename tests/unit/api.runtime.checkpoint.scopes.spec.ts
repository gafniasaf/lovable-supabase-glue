import { POST as SavePOST } from '../../apps/web/src/app/api/runtime/checkpoint/save/route';
import { GET as LoadGET } from '../../apps/web/src/app/api/runtime/checkpoint/load/route';

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
function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: { origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any } as any);
}

describe('runtime checkpoint scopes', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret' } as any; delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY; });
  afterEach(() => { process.env = original; });

  test('save requires progress.write; load requires progress.read', async () => {
    // Save without scope -> 403
    let token = makeJwt([]);
    let res = await (SavePOST as any)(post('http://localhost/api/runtime/checkpoint/save', { key: 'k', state: { a: 1 } }, { authorization: `Bearer ${token}` }));
    expect(res.status).toBe(403);
    // Save with scope -> 201
    token = makeJwt(['progress.write']);
    res = await (SavePOST as any)(post('http://localhost/api/runtime/checkpoint/save', { key: 'k', state: { a: 1 } }, { authorization: `Bearer ${token}` }));
    expect([200,201,204]).toContain(res.status);
    // Load without scope -> 403
    token = makeJwt([]);
    res = await (LoadGET as any)(get('http://localhost/api/runtime/checkpoint/load?key=k', { authorization: `Bearer ${token}` }));
    expect([401,403]).toContain(res.status);
    // Load with scope -> 200
    token = makeJwt(['progress.read']);
    res = await (LoadGET as any)(get('http://localhost/api/runtime/checkpoint/load?key=k', { authorization: `Bearer ${token}` }));
    expect([200]).toContain(res.status);
  });
});


