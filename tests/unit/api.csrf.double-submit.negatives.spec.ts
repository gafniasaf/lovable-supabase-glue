import { POST as AssignPOST } from '../../apps/web/src/app/api/assignments/route';

function post(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('CSRF double-submit negatives (when enabled)', () => {
  const url = 'http://localhost/api/assignments';
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; (process.env as any).CSRF_DOUBLE_SUBMIT = '1'; });
  afterEach(() => { delete (process.env as any).CSRF_DOUBLE_SUBMIT; });

  test('missing csrf headers → 403', async () => {
    // @ts-ignore simulate teacher auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (AssignPOST as any)(post(url, { course_id: '00000000-0000-0000-0000-000000000001', title: 'A' }));
    expect(res.status).toBe(403);
  });

  test('mismatch cookie/header → 403', async () => {
    // Simulate cookie but wrong header
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__ = { cookies: { get: (k: string)=> ({ name: k, value: 'cookie-token' }), set: ()=>{} } } as any;
    const res = await (AssignPOST as any)(post(url, { course_id: '00000000-0000-0000-0000-000000000001', title: 'A' }, { 'x-csrf-token': 'bad' }));
    expect(res.status).toBe(403);
  });
});


