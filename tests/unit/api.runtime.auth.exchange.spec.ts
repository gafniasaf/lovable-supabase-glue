import { POST as ExchangePOST } from '../../apps/web/src/app/api/runtime/auth/exchange/route';
import * as supa from '../helpers/supabaseMock';

function base64url(input: Buffer | string) { const b = Buffer.isBuffer(input) ? input : Buffer.from(String(input)); return b.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }
function makeHsToken(payload: Record<string, any>, secret = 'dev-secret') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h64 = base64url(JSON.stringify(header));
  const p64 = base64url(JSON.stringify(payload));
  const data = `${h64}.${p64}`;
  const crypto = require('crypto');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return `${data}.${sig}`;
}

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/runtime/auth/exchange', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime auth exchange', () => {
  const original = { ...process.env };
  beforeEach(() => { jest.restoreAllMocks(); process.env = { ...original, RUNTIME_API_V2: '1', NEXT_RUNTIME_SECRET: 'dev-secret' } as any; });
  afterEach(() => { process.env = original; });

  test('invalid token → 403', async () => {
    const res = await (ExchangePOST as any)(post({ token: 'bad' }));
    expect(res.status).toBe(403);
  });

  test('audience mismatch when origin allowed → 403', async () => {
    // course launch_url origin differs from request origin
    const mock = (supa as any).makeSupabaseMock({ courses: () => supa.supabaseOk({ provider_id: null, launch_url: 'https://provider.other/app' }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    (process.env as any).RUNTIME_CORS_ALLOW = 'https://provider.example';
    const now = Math.floor(Date.now()/1000);
    // Minimal launch claims
    const claims = { sub: 'u1', courseId: 'c1', nonce: 'n1', scopes: [], iat: now, exp: now + 60 };
    const token = makeHsToken(claims);
    const res = await (ExchangePOST as any)(new Request('http://localhost/api/runtime/auth/exchange', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example' } as any, body: JSON.stringify({ token }) } as any));
    expect(res.status).toBe(403);
  });

  test('valid dev token and matching origin → 200 returns runtimeToken', async () => {
    const mock = (supa as any).makeSupabaseMock({ courses: () => supa.supabaseOk({ provider_id: null, launch_url: 'https://provider.example/app' }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    (process.env as any).RUNTIME_CORS_ALLOW = 'https://provider.example';
    (process.env as any).TEST_MODE = '1'; // bypass nonce checks
    const now = Math.floor(Date.now()/1000);
    const claims = { sub: 'u1', courseId: 'c1', nonce: 'n1', scopes: ['progress.write'], iat: now, exp: now + 60 };
    const token = makeHsToken(claims);
    const res = await (ExchangePOST as any)(new Request('http://localhost/api/runtime/auth/exchange', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example' } as any, body: JSON.stringify({ token }) } as any));
    expect([200]).toContain(res.status);
    const json = await res.json();
    expect(json.runtimeToken).toBeTruthy();
    expect(json.expiresAt).toBeTruthy();
  });
});


