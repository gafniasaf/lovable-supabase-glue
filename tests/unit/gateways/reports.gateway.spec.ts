import { createReportsGateway } from '@/lib/data/reports';

describe('ReportsGateway', () => {
  const originalFetch = global.fetch as any;

  afterEach(() => { (global as any).fetch = originalFetch; });

  it('engagement returns counters (course scoped)', async () => {
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ lessons: 3, assignments: 2, submissions: 9 }),
      text: async () => JSON.stringify({ lessons: 3, assignments: 2, submissions: 9 }),
      headers: { get: () => null }
    }));
    const out = await createReportsGateway().engagement('c-1');
    expect(out.lessons).toBe(3);
    expect(out.assignments).toBe(2);
  });

  it('gradeDistribution returns shape (admin/global)', async () => {
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ total: 10, average: 80, dist: [{ bucket: '80-89', count: 6 }] }),
      text: async () => JSON.stringify({ total: 10, average: 80, dist: [{ bucket: '80-89', count: 6 }] }),
      headers: { get: () => null }
    }));
    const out = await createReportsGateway().gradeDistribution();
    expect(out.total).toBe(10);
    expect(out.dist[0].bucket).toBe('80-89');
  });
});



