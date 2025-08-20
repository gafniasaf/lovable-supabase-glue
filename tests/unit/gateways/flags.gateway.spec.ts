import { createFlagsGateway } from '@/lib/data/flags';

describe('FlagsGateway', () => {
  const originalFetch = global.fetch as any;
  afterEach(() => { (global as any).fetch = originalFetch; });

  it('list returns flags map', async () => {
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ A: true, B: false }),
      text: async () => JSON.stringify({ A: true, B: false }),
      headers: { get: () => null }
    }));
    const out = await createFlagsGateway().list();
    expect(out.A).toBe(true);
  });
});


