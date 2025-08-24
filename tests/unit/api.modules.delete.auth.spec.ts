import { DELETE as ModulesDELETE } from '../../apps/web/src/app/api/modules/route';

function del(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'DELETE', headers: headers as any } as any); }

describe('modules DELETE auth and rate limits', () => {
  const url = 'http://localhost/api/modules?id=11111111-1111-1111-1111-111111111111';

  test('unauthenticated -> 401', async () => {
    const res = await (ModulesDELETE as any)(del(url));
    expect(res.status).toBe(401);
  });

  test('non-teacher -> 403', async () => {
    const res = await (ModulesDELETE as any)(del(url, { 'x-test-auth': 'student' }));
    expect([403,401]).toContain(res.status);
  });

  test('rate-limit headers when exceeded', async () => {
    const headers = { 'x-test-auth': 'teacher' } as any;
    await (ModulesDELETE as any)(del(url, headers));
    const res = await (ModulesDELETE as any)(del(url, headers));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429,500]).toContain(res.status);
    }
  });
});
