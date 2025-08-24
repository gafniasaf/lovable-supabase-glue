import { incrementUsageCounter } from '../../apps/web/src/lib/usage';
import * as supa from '../helpers/supabaseMock';

describe('incrementUsageCounter', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('upserts with incremented counters when row exists', async () => {
    const upserts: any[] = [];
    const mock = {
      from: (_tbl: string) => ({
        select: () => ({
          eq: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: { count: 2, storage_bytes: 10, compute_minutes: 3 }, error: null }) }) }) })
        }),
        upsert: async (row: any) => { upserts.push(row); return { data: {}, error: null }; }
      })
    } as any;
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);

    await incrementUsageCounter({ metric: 'runtime.progress', courseId: 'c1', providerId: null, count: 5, storageBytes: 2, computeMinutes: 0 });
    expect(upserts.length).toBe(1);
    expect(upserts[0].count).toBe(7);
    expect(upserts[0].storage_bytes).toBe(12);
    expect(upserts[0].compute_minutes).toBe(3);
  });

  test('upserts with initial values when row does not exist', async () => {
    const upserts: any[] = [];
    const mock = {
      from: (_tbl: string) => ({
        select: () => ({
          eq: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) })
        }),
        upsert: async (row: any) => { upserts.push(row); return { data: {}, error: null }; }
      })
    } as any;
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);

    await incrementUsageCounter({ metric: 'runtime.grade', courseId: 'c2', providerId: 'p1', count: 1, storageBytes: 0, computeMinutes: 4 });
    expect(upserts.length).toBe(1);
    expect(upserts[0].count).toBe(1);
    expect(upserts[0].compute_minutes).toBe(4);
  });
});


