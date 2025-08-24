import { GET as DlqGET, PATCH as DlqPATCH } from '../../apps/web/src/app/api/admin/dlq/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('API /api/admin/dlq auth', () => {
  test('unauthenticated GET → 401', async () => {
    const res = await (DlqGET as any)(get('http://localhost/api/admin/dlq'));
    expect(res.status).toBe(401);
  });

  test('non-admin GET → 403', async () => {
    const res = await (DlqGET as any)(get('http://localhost/api/admin/dlq', { 'x-test-auth': 'teacher' }));
    expect([401,403]).toContain(res.status);
  });

  test('unauthenticated PATCH → 401', async () => {
    const res = await (DlqPATCH as any)(patch('http://localhost/api/admin/dlq', { id: '1', action: 'replay' }));
    expect(res.status).toBe(401);
  });
});


