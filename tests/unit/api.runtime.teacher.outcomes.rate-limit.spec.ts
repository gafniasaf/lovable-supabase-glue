import { GET as TeacherOutcomesGET } from '../../apps/web/src/app/api/runtime/teacher/outcomes/route';

function get(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers } as any);
}

describe('runtime teacher outcomes rate limiting', () => {
  beforeAll(() => {
    process.env.RUNTIME_OUTCOMES_LIMIT = '2';
    process.env.RUNTIME_OUTCOMES_WINDOW_MS = '60000';
  });

  test('third request -> 429 with headers', async () => {
    const url = 'http://localhost/api/runtime/teacher/outcomes';
    const h = { 'x-test-auth': 'teacher' } as Record<string, string>;
    const r1 = await (TeacherOutcomesGET as any)(get(url, h));
    expect([200,500]).toContain(r1.status);
    const r2 = await (TeacherOutcomesGET as any)(get(url, h));
    expect([200,500]).toContain(r2.status);
    const r3 = await (TeacherOutcomesGET as any)(get(url, h));
    expect(r3.status).toBe(429);
    const retry = r3.headers.get('retry-after');
    const remaining = r3.headers.get('x-rate-limit-remaining');
    const reset = r3.headers.get('x-rate-limit-reset');
    expect(retry && parseInt(retry, 10) >= 0).toBe(true);
    expect(remaining).toBe('0');
    expect(reset && parseInt(reset, 10) > 0).toBe(true);
  });
});


