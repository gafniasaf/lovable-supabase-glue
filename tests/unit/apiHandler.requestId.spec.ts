import { createApiHandler } from '../../apps/web/src/server/apiHandler';
import { z } from 'zod';

function makeRequest(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(headers || {}) },
    body: JSON.stringify(body)
  });
}

describe('createApiHandler request id behavior', () => {
  test('reuses upstream x-request-id and echoes it back', async () => {
    const handler = createApiHandler({
      schema: z.object({ x: z.number() }),
      handler: async (input, ctx) => Response.json({ ok: true, requestId: ctx.requestId })
    });
    const res = await handler(makeRequest({ x: 1 }, { 'x-request-id': 'abc-123' }));
    expect(res.headers.get('x-request-id')).toBe('abc-123');
    const json = await res.json();
    expect(json.requestId).toBe('abc-123');
  });

  test('generates a request id when missing', async () => {
    const handler = createApiHandler({
      schema: z.object({ x: z.number() }),
      handler: async (_input, ctx) => Response.json({ requestId: ctx.requestId })
    });
    const res = await handler(makeRequest({ x: 1 }));
    const id = res.headers.get('x-request-id');
    expect(id).toBeTruthy();
  });
});


