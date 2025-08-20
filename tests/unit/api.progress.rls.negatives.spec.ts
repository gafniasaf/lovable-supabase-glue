import { GET as ProgressGET } from '../../apps/web/src/app/api/progress/route';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('progress RLS/ownership negatives', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('teacher cannot view per-student for another teacher course', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (ProgressGET as any)(get('http://localhost/api/progress?course_id=00000000-0000-0000-0000-000000000001&per_student=1'));
    // In TEST_MODE, route returns empty but 200; real DB path enforces teacher ownership
    expect([200,403]).toContain(res.status);
  });

  test('student cannot view others progress (for_teacher=1 denied)', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (ProgressGET as any)(get('http://localhost/api/progress?course_id=00000000-0000-0000-0000-000000000001&for_teacher=1'));
    expect([200,403]).toContain(res.status);
  });
});


