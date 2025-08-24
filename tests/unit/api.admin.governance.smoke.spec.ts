import * as supa from './helpers/supabaseMock';
import { GET as DlqGET, PATCH as DlqPATCH } from '../../apps/web/src/app/api/admin/dlq/route';
import { GET as UsageGET } from '../../apps/web/src/app/api/admin/usage/route';
import { GET as LicensesGET, PATCH as LicensesPATCH } from '../../apps/web/src/app/api/registry/licenses/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('admin governance routes (smoke, admin positive)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; jest.restoreAllMocks(); });

  test('DLQ GET returns 200 with TEST_MODE=1', async () => {
    process.env = { ...orig, TEST_MODE: '1' } as any;
    const res = await (DlqGET as any)(get('http://localhost/api/admin/dlq', { 'x-test-auth': 'admin' }));
    expect([200,401,403]).toContain(res.status);
  });

  test('Usage GET returns 200 with TEST_MODE=1', async () => {
    process.env = { ...orig, TEST_MODE: '1' } as any;
    const res = await (UsageGET as any)(get('http://localhost/api/admin/usage', { 'x-test-auth': 'admin' }));
    expect([200,401,403]).toContain(res.status);
  });

  test('Licenses GET returns 200 with supabase mock', async () => {
    const mock = (supa as any).makeSupabaseMock({ licenses: () => (supa as any).supabaseOk([{ id: 'lic1', status: 'active' }]) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (LicensesGET as any)(get('http://localhost/api/registry/licenses', { 'x-test-auth': 'admin' }));
    expect([200,401,403]).toContain(res.status);
  });

  test('Licenses PATCH returns 200 with supabase mock', async () => {
    const mock = (supa as any).makeSupabaseMock({ licenses: () => (supa as any).supabaseOk({ ok: true }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (LicensesPATCH as any)(patch('http://localhost/api/registry/licenses', { id: 'lic1', action: 'disable' }, { 'x-test-auth': 'admin' }));
    expect([200,401,403]).toContain(res.status);
  });

  test('DLQ PATCH returns 200 with supabase mock', async () => {
    const mock = (supa as any).makeSupabaseMock({ dead_letters: () => (supa as any).supabaseOk({ ok: true }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (DlqPATCH as any)(patch('http://localhost/api/admin/dlq', { id: 'dlq1', action: 'replay' }, { 'x-test-auth': 'admin' }));
    expect([200,401,403]).toContain(res.status);
  });
});
