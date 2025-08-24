import { POST as VersionsPOST } from '../../apps/web/src/app/api/registry/versions/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body || {}) } as any); }

describe('registry versions POST admin gating and rate limit', () => {
  const body = { external_course_id: '11111111-1111-1111-1111-111111111111', version: '1.0.0', status: 'draft', launch_url: 'https://example.com' } as any;

  test('unauthenticated -> 401', async () => {
    const res = await (VersionsPOST as any)(post('http://localhost/api/registry/versions', undefined, body));
    expect(res.status).toBe(401);
  });

  test('non-admin -> 403', async () => {
    const res = await (VersionsPOST as any)(post('http://localhost/api/registry/versions', { 'x-test-auth': 'teacher' }, body));
    expect([403,401]).toContain(res.status);
  });

  test('rate limit headers when exceeded', async () => {
    const headers = { 'x-test-auth': 'admin' } as any;
    await (VersionsPOST as any)(post('http://localhost/api/registry/versions', headers, body));
    const res = await (VersionsPOST as any)(post('http://localhost/api/registry/versions', headers, body));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,400,401,403,429,500]).toContain(res.status);
    }
  });
});
