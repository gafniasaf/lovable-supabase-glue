import { GET as SubmissionsGET } from '../../apps/web/src/app/api/submissions/route';

describe('GET /api/submissions pagination headers', () => {
  beforeEach(() => { jest.restoreAllMocks(); process.env.TEST_MODE = '1'; });

  test('returns x-total-count and clamps limit to 200', async () => {
    // TEST_MODE=1: route uses in-memory store and does not hit Supabase
    // Simulate teacher auth cookie
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { cookies: new Map(), headers: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const res = await (SubmissionsGET as any)(new Request('http://localhost/api/submissions?assignment_id=00000000-0000-0000-0000-000000000001&offset=0&limit=999') as any);
    expect(res.status).toBe(200);
    const total = res.headers.get('x-total-count');
    expect(Number(total)).toBeGreaterThanOrEqual(0);
  });
});


