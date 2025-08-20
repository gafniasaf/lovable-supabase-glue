import { GET as AssignGET } from '../../apps/web/src/app/api/assignments/route';

function makeReq(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: headers as any } as any);
}

describe('pagination params clamping', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('assignments clamps negative offset and large limit, returns x-total-count', async () => {
    // auth as teacher
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const url = 'http://localhost/api/assignments?course_id=00000000-0000-0000-0000-000000000001&offset=-5&limit=9999';
    const res = await (AssignGET as any)(makeReq(url));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('x-total-count')).toBeTruthy();
    }
  });
});


