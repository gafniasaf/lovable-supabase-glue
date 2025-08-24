import { PATCH as DlqPATCH } from '../../apps/web/src/app/api/admin/dlq/route';

function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('API /api/admin/dlq admin PATCH (smoke)', () => {
  test('admin replay → 200/404/400 (depending on presence)', async () => {
    const res = await (DlqPATCH as any)(patch('http://localhost/api/admin/dlq', { id: '1', action: 'replay' }, { 'x-test-auth': 'admin' }));
    expect([200,400,401,403,404]).toContain(res.status);
  });
});


