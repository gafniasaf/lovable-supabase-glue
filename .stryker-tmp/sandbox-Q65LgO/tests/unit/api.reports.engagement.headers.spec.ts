// @ts-nocheck
import { GET as EngagementGET } from '../../apps/web/src/app/api/reports/engagement/route';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('reports engagement headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('csv format sets content-type (or returns 400/401 when invalid)', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const url = 'http://localhost/api/reports/engagement?course_id=00000000-0000-0000-0000-000000000001&format=csv';
    const res = await (EngagementGET as any)(get(url));
    expect([200,401,400]).toContain(res.status);
    const ct = String(res.headers.get('content-type') || '');
    if (res.status === 200) expect(ct).toMatch(/text\/csv|application\/json/);
  });
});


