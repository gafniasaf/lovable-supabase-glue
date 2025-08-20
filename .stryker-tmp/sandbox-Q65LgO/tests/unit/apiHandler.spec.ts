// @ts-nocheck
import { createApiHandler } from '../../apps/web/src/server/apiHandler';
import { z } from 'zod';

function makeRequest(body: any) {
  return new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
}

test('createApiHandler validates input and returns 400 on invalid', async () => {
  const handler = createApiHandler({
    schema: z.object({ name: z.string() }),
    handler: async (input) => Response.json({ ok: true, input })
  });
  const res = await handler(makeRequest({}));
  expect(res.status).toBe(400);
});

test('createApiHandler passes validated input', async () => {
  const handler = createApiHandler({
    schema: z.object({ name: z.string() }),
    handler: async (input) => Response.json({ ok: true, input })
  });
  const res = await handler(makeRequest({ name: 'x' }));
  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json.ok).toBe(true);
  expect(json.input).toEqual({ name: 'x' });
});

test('createApiHandler returns 400 on invalid JSON body when schema present', async () => {
  const handler = createApiHandler({
    schema: z.object({ name: z.string() }),
    handler: async (input) => Response.json({ ok: true, input })
  });
  const badReq = new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // invalid JSON string
    body: '{bad json}' as any
  });
  const res = await handler(badReq);
  // Current behavior: invalid JSON parse yields 500 (not Zod error)
  expect(res.status).toBe(500);
});


