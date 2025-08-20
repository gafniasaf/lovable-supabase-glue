import { GET as ModulesGET, PATCH as ModulesPATCH, DELETE as ModulesDELETE } from '../../apps/web/src/app/api/modules/route';

function makeGet(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'GET', headers }); }
function makePatch(url: string, body: any, headers?: Record<string, string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) }); }
function makeDelete(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'DELETE', headers }); }

describe('API /api/modules', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('GET requires course_id → 400', async () => {
    const res = await (ModulesGET as any)(makeGet('http://localhost/api/modules', { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
  });

  test('PATCH missing id → 400; empty body → 400', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const missingId = await (ModulesPATCH as any)(makePatch('http://localhost/api/modules', { title: 'X' }));
    expect(missingId.status).toBe(400);
    const emptyBody = await (ModulesPATCH as any)(makePatch('http://localhost/api/modules?id=mm', {}));
    expect(emptyBody.status).toBe(400);
  });

  test('DELETE missing id → 400; non-teacher → 403', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const missing = await (ModulesDELETE as any)(makeDelete('http://localhost/api/modules'));
    expect(missing.status).toBe(400);
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const forbidden = await (ModulesDELETE as any)(makeDelete('http://localhost/api/modules?id=mm'));
    expect(forbidden.status).toBe(403);
  });
});


