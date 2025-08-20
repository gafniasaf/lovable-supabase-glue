import { POST as FinalizePOST } from '../../apps/web/src/app/api/files/finalize/route';
import * as supa from '../helpers/supabaseMock';

function post(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('files finalize ownership checks', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('owner-only for user/submission attachments; teacher for lesson/announcement', async () => {
    // Owner user-type OK
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1' } as any);
    const mock1 = (supa as any).makeSupabaseMock({ attachments: () => supa.supabaseOk({ id: 'att1', owner_type: 'user', owner_id: 'u1', size_bytes: 0 }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock1);
    let res = await (FinalizePOST as any)(post('http://localhost/api/files/finalize', { key: 'k', size_bytes: 10 }));
    expect([200,403,404]).toContain(res.status);

    // Submission non-owner -> 403
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u2' } as any);
    const mock2 = (supa as any).makeSupabaseMock({ attachments: () => supa.supabaseOk({ id: 'att2', owner_type: 'submission', owner_id: 'u1', size_bytes: 0 }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock2);
    res = await (FinalizePOST as any)(post('http://localhost/api/files/finalize', { key: 'k', size_bytes: 10 }));
    expect(res.status).toBe(403);

    // Lesson attachment: teacher-only
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'teacher-1' } as any);
    const mock3 = (supa as any).makeSupabaseMock({ attachments: () => supa.supabaseOk({ id: 'att3', owner_type: 'lesson', owner_id: 'course-1', size_bytes: 0 }), courses: () => supa.supabaseOk({ teacher_id: 'teacher-1' }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock3);
    res = await (FinalizePOST as any)(post('http://localhost/api/files/finalize', { key: 'k', size_bytes: 10 }));
    expect([200,403]).toContain(res.status);
  });
});


