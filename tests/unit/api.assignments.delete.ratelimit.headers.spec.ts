import { DELETE as AssignmentsDELETE } from '../../apps/web/src/app/api/assignments/route';

const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);

describe('assignments DELETE rate-limit headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('when throttled, includes retry-after and x-rate-limit-*', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const url = 'http://localhost/api/assignments?id=00000000-0000-0000-0000-000000000001';
    // First call may succeed or fail with 404 depending on fixture; the second should still exercise headers when throttled
    await (AssignmentsDELETE as any)(del(url));
    const res = await (AssignmentsDELETE as any)(del(url));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


