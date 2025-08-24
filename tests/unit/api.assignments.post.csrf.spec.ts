import { POST as AssignmentsPOST } from '../../apps/web/src/app/api/assignments/route';

function post(body: any, headers?: Record<string,string>) {
  return new Request('http://localhost/api/assignments', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('assignments POST CSRF double-submit', () => {
  const original = { ...process.env };
  beforeEach(() => {
    process.env = { ...original, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost', TEST_MODE: '1' } as any;
    // @ts-ignore simulate teacher auth
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });
  afterEach(() => { process.env = original; });

  test('403 missing/mismatched tokens; 201 when matched', async () => {
    const payload = { course_id: '00000000-0000-0000-0000-000000000001', title: 'New Assignment', points: 100 };
    // Missing tokens
    let res = await (AssignmentsPOST as any)(post(payload, { origin: 'http://localhost', referer: 'http://localhost/x' }));
    expect([400,403]).toContain(res.status);
    // Mismatch
    res = await (AssignmentsPOST as any)(post(payload, { origin: 'http://localhost', referer: 'http://localhost/x', cookie: 'csrf_token=a', 'x-csrf-token': 'b' }));
    expect([400,403]).toContain(res.status);
    // Match
    res = await (AssignmentsPOST as any)(post(payload, { origin: 'http://localhost', referer: 'http://localhost/x', cookie: 'csrf_token=t', 'x-csrf-token': 't' }));
    expect([200,201]).toContain(res.status);
  });
});


