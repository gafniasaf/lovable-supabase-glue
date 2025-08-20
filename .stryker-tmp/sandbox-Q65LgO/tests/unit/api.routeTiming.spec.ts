// @ts-nocheck
import { withRouteTiming } from '../../apps/web/src/server/withRouteTiming';

describe('withRouteTiming observability', () => {
  test('route_success logs and echoes requestId', async () => {
    const handler = withRouteTiming(async () => new Response('ok')) as (req: Request) => Promise<Response>;
    const req = new Request('http://localhost/api/ping', { headers: { 'x-request-id': 'rq-1' } });
    const res = await handler(req);
    expect(res.headers.get('x-request-id')).toBe('rq-1');
  });

  test('route_error logs includes requestId when thrown', async () => {
    const failing = withRouteTiming(async () => { throw new Error('boom'); }) as (req: Request) => Promise<Response>;
    await expect(failing(new Request('http://localhost/api/err', { headers: { 'x-request-id': 'rq-2' } }))).rejects.toThrow('boom');
  });
});


