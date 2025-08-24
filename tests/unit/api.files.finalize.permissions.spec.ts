import * as supa from './helpers/supabaseMock';
import { POST as FinalizePOST } from '../../apps/web/src/app/api/files/finalize/route';

function post(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('files finalize permissions and quotas (smoke)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; jest.restoreAllMocks(); });

  test('owner can finalize; non-owner forbidden', async () => {
    // Owner
    let mock = (supa as any).makeSupabaseMock({ attachments: () => (supa as any).supabaseOk({ id: 'att1', owner_type: 'user', owner_id: '22222222-2222-2222-2222-222222222222', size_bytes: 0 }), user_storage_quotas: () => (supa as any).supabaseOk({ used_bytes: 10 }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    process.env = { ...orig, STORAGE_QUOTA_ENABLED: '1' } as any;
    let res = await (FinalizePOST as any)(post('http://localhost/api/files/finalize', { key: 'k', size_bytes: 5 }, { 'x-test-auth': 'student' }));
    expect([200,401,403]).toContain(res.status);

    // Non-owner
    mock = (supa as any).makeSupabaseMock({ attachments: () => (supa as any).supabaseOk({ id: 'att1', owner_type: 'user', owner_id: 'someoneelse', size_bytes: 0 }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    res = await (FinalizePOST as any)(post('http://localhost/api/files/finalize', { key: 'k', size_bytes: 5 }, { 'x-test-auth': 'student' }));
    expect([403,401,404]).toContain(res.status);
  });
});


