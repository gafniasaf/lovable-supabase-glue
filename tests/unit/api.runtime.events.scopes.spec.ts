import { POST as EventsPOST } from '../../apps/web/src/app/api/runtime/events/route';

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

describe('runtime events scopes', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret' } as any; delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY; });
  afterEach(() => { process.env = original; });

  test('course.progress requires progress.write; course.attempt.completed requires attempts.write', async () => {
    // Missing scope for progress -> 403
    let token = makeJwt([]);
    let res = await (EventsPOST as any)(post('http://localhost/api/runtime/events', { type: 'course.progress', pct: 10 }, { authorization: `Bearer ${token}` }));
    expect(res.status).toBe(403);
    // Provide progress.write -> 201
    token = makeJwt(['progress.write']);
    res = await (EventsPOST as any)(post('http://localhost/api/runtime/events', { type: 'course.progress', pct: 10 }, { authorization: `Bearer ${token}` }));
    expect([200,201,204]).toContain(res.status);
    // Missing attempts.write for attempt.completed -> 403
    token = makeJwt([]);
    res = await (EventsPOST as any)(post('http://localhost/api/runtime/events', { type: 'course.attempt.completed', score: 1, max: 1, passed: true }, { authorization: `Bearer ${token}` }));
    expect(res.status).toBe(403);
    // attempts.write present -> 201
    token = makeJwt(['attempts.write']);
    res = await (EventsPOST as any)(post('http://localhost/api/runtime/events', { type: 'course.attempt.completed', score: 1, max: 1, passed: true }, { authorization: `Bearer ${token}` }));
    expect([200,201,204]).toContain(res.status);
  });
});


