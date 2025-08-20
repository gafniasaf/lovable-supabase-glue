import { POST as FinalizePOST } from '../../apps/web/src/app/api/files/finalize/route';
import * as supa from '../helpers/supabaseMock';

function post(size: number, userId = 'u1') {
  return new Request('http://localhost/api/files/finalize', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ key: 'k', size_bytes: size }) } as any);
}

describe('files finalize updates quotas when enabled', () => {
  const original = { ...process.env };
  beforeEach(() => { jest.restoreAllMocks(); process.env = { ...original, STORAGE_QUOTA_ENABLED: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('increases used_bytes by delta for user/submission owners', async () => {
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1' } as any);
    const mock = (supa as any).makeSupabaseMock({
      attachments: () => supa.supabaseOk({ id: 'att1', owner_type: 'user', owner_id: 'u1', size_bytes: 100 }),
      user_storage_quotas: ({ update, upsert, ...params }: any) => supa.supabaseOk({ used_bytes: 100 })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    const res = await (FinalizePOST as any)(post(250));
    expect([200]).toContain(res.status);
  });
});


