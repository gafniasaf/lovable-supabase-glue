import { GET as ParentProgressGET } from '../../apps/web/src/app/api/parent/progress/route';

function makeGet(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'GET', headers }); }

describe('API /api/parent/progress (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('unauth → 401', async () => {
    const res = await (ParentProgressGET as any)(makeGet('http://localhost/api/parent/progress?student_id=s1'));
    expect(res.status).toBe(401);
  });

  test('parent linked to student gets data', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'parent');
    const res = await (ParentProgressGET as any)(makeGet('http://localhost/api/parent/progress?student_id=22222222-2222-2222-2222-222222222222'));
    expect(res.status).toBe(200);
  });
});


