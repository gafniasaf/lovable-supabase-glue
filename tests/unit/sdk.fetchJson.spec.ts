import { fetchJson } from "../../apps/web/src/lib/serverFetch";
import { z } from "zod";

describe('fetchJson', () => {
  test('throws on non-OK with error payload', async () => {
    const schema = z.object({ ok: z.literal(true) });
    const server = globalThis.fetch = jest.fn(async () => new Response(JSON.stringify({ error: { code: 'BAD_REQUEST', message: 'nope' } }), { status: 400 } as any)) as any;
    await expect(fetchJson('/x', schema)).rejects.toThrow('BAD_REQUEST: nope');
    expect(server).toHaveBeenCalled();
  });
  test('validates ok JSON against schema', async () => {
    const schema = z.object({ ok: z.literal(true) });
    globalThis.fetch = jest.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 } as any)) as any;
    const res = await fetchJson('/y', schema);
    expect(res.ok).toBe(true);
  });
});


