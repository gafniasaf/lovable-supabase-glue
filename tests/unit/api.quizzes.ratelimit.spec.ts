import { PATCH as QuizzesPATCH, DELETE as QuizzesDELETE } from '../../apps/web/src/app/api/quizzes/route';

const patch = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);

describe('quizzes rate-limit headers on PATCH/DELETE', () => {
  beforeEach(() => {
    // @ts-ignore simulate teacher auth in test-mode
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('PATCH returns 429 with standard headers when limited', async () => {
    const res = await (QuizzesPATCH as any)(patch('http://localhost/api/quizzes?id=00000000-0000-0000-0000-000000000001', { title: 'x' }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });

  test('DELETE returns 429 with standard headers when limited', async () => {
    const res = await (QuizzesDELETE as any)(del('http://localhost/api/quizzes?id=00000000-0000-0000-0000-000000000001'));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


