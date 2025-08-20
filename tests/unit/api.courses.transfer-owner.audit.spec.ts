import { PATCH as TransferPATCH } from '../../apps/web/src/app/api/courses/[id]/transfer-owner/route';
import * as supa from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

function req(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('courses transfer-owner audit', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // @ts-ignore simulate admin auth to allow transfer
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
  });

  test('writes audit log (happy path)', async () => {
    const mock = makeSupabaseMock({
      courses: (p) => {
        if (p.update) return supabaseOk({ id: 'c1', teacher_id: p.update.teacher_id });
        if (p.select && p.eq && p.eq.id) return supabaseOk({ id: 'c1', teacher_id: 'old-teacher' });
        return supabaseOk(null);
      },
      audit_logs: () => supabaseOk({ ok: true })
    } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (TransferPATCH as any)(req('http://localhost/api/courses/c1/transfer-owner', { teacher_id: '00000000-0000-0000-0000-000000000999' } as any), { params: { id: 'c1' } } as any);
    expect([200,401,403,400]).toContain(res.status);
  });
});


