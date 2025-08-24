import { PATCH as VersionsPATCH } from '../../apps/web/src/app/api/registry/versions/route';

function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('Registry versions approve/disable (admin-only)', () => {
  test('non-admin → 403', async () => {
    const res = await (VersionsPATCH as any)(patch('http://localhost/api/registry/versions?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { status: 'approved' }, { 'x-test-auth': 'teacher' }));
    expect([401,403]).toContain(res.status);
  });
});


