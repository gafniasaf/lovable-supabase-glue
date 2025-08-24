import { POST as OutcomesPOST } from '../../apps/web/src/app/api/runtime/outcomes/route';
import * as supa from '../helpers/supabaseMock';

function post(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

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

describe('runtime outcomes accepts runtime token when no jwks', () => {
  const original = { ...process.env };
  beforeEach(() => { jest.restoreAllMocks(); process.env = { ...original, RUNTIME_API_V2: '1', NEXT_RUNTIME_SECRET: 'dev-secret' } as any; });
  afterEach(() => { process.env = original; });

  test('403 when missing attempts.write scope; 201 when scope present', async () => {
    const mock = (supa as any).makeSupabaseMock({
      courses: () => supa.supabaseOk({ id: 'c1', provider_id: null }),
      interactive_attempts: (p: any) => supa.supabaseOk({ id: 'ia1', course_id: 'c1', user_id: 'u1', score: p?.insert?.score ?? 1, max: p?.insert?.max ?? 1, passed: p?.insert?.passed ?? true })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    const now = Math.floor(Date.now()/1000);
    // Missing scope
    let token = makeHsToken({ sub: 'u1', courseId: 'c1', scopes: [], iat: now, exp: now + 60 });
    let res = await (OutcomesPOST as any)(post('http://localhost/api/runtime/outcomes', { courseId: 'c1', userId: 'u1', event: { type: 'attempt.completed', score: 1, max: 1, passed: true } }, { authorization: `Bearer ${token}` }));
    expect(res.status).toBe(403);
    // With attempts.write scope
    token = makeHsToken({ sub: 'u1', courseId: 'c1', scopes: ['attempts.write'], iat: now, exp: now + 60 });
    res = await (OutcomesPOST as any)(post('http://localhost/api/runtime/outcomes', { courseId: 'c1', userId: 'u1', event: { type: 'attempt.completed', score: 1, max: 1, passed: true } }, { authorization: `Bearer ${token}` }));
    expect([200,201]).toContain(res.status);
  });
});


