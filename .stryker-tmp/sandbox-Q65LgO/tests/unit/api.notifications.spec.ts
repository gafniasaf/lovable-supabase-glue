// @ts-nocheck
import { GET as NotifGET, PATCH as NotifPATCH } from '../../apps/web/src/app/api/notifications/route';
import * as supa from '../../apps/web/src/lib/supabaseServer';
import * as store from '../../apps/web/src/lib/testStore';

describe('api.notifications (test-mode)', () => {
  const originalEnv = process.env;
  beforeEach(() => { jest.restoreAllMocks(); process.env = { ...originalEnv, TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = originalEnv; });

  test('GET returns notifications array for logged-in user', async () => {
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u-stud', user_metadata: { role: 'student' } } as any);
    jest.spyOn(store as any, 'listTestNotificationsByUser').mockReturnValue([{ id: '00000000-0000-0000-0000-000000000001', user_id: 'u-stud', type: 'info', payload: {}, created_at: new Date().toISOString(), read_at: null }]);
    const res = await (NotifGET as any)(new Request('http://localhost/api/notifications') as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  test('PATCH marks read and returns row', async () => {
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u-stud', user_metadata: { role: 'student' } } as any);
    jest.spyOn(store as any, 'markTestNotificationRead').mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', user_id: 'u-stud', type: 'info', payload: {}, created_at: new Date().toISOString(), read_at: new Date().toISOString() });
    const res = await (NotifPATCH as any)(new Request('http://localhost/api/notifications?id=00000000-0000-0000-0000-000000000001', { method: 'PATCH' }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(json.read_at).toBeTruthy();
  });
});


