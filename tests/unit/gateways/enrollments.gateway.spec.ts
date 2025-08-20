import { createEnrollmentsGateway } from '@/lib/data/enrollments';

describe('EnrollmentsGateway.list', () => {
  const originalFetch = global.fetch as any;

  beforeEach(() => {
    (global as any).fetch = jest.fn(async (url: string) => {
      const data = [
        { id: 'e-1', student_id: 'u-1', course_id: 'c-1', created_at: new Date().toISOString() },
        { id: 'e-2', student_id: 'u-1', course_id: 'c-2', created_at: new Date().toISOString() }
      ];
      return {
        ok: true,
        status: 200,
        json: async () => data,
        text: async () => JSON.stringify(data),
        headers: { get: () => null }
      } as any;
    });
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('returns enrollments array', async () => {
    const rows = await createEnrollmentsGateway().list();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveProperty('course_id', 'c-1');
  });
});



