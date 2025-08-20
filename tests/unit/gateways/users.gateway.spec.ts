import { createUsersGateway } from '@/lib/data/users';

describe('UsersGateway', () => {
  const originalFetch = global.fetch as any;
  afterEach(() => { (global as any).fetch = originalFetch; });

  it('updateRole sends PATCH and returns ok', async () => {
    (global as any).fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
      text: async () => JSON.stringify({ ok: true }),
      headers: { get: () => null }
    }));
    const out = await createUsersGateway().updateRole({ userId: 'u-1', role: 'teacher' });
    expect(out.ok).toBe(true);
  });
});


