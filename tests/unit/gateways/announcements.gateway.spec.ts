import { createAnnouncementsGateway } from '@/lib/data/announcements';

describe('AnnouncementsGateway', () => {
  const originalFetch = global.fetch as any;

  beforeEach(() => {
    (global as any).fetch = jest.fn(async (url: string) => {
      const data = [
        { id: 'a-1', course_id: 'c-1', title: 'T1', body: 'B1', created_at: new Date().toISOString() },
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

  afterEach(() => { (global as any).fetch = originalFetch; });

  it('listAll returns rows', async () => {
    const rows = await createAnnouncementsGateway().listAll();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveProperty('title', 'T1');
  });
});



