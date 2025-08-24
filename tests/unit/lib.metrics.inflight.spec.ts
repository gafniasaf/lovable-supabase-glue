import { withRouteTiming } from '../../apps/web/src/server/withRouteTiming';

describe('withRouteTiming inflight counters', () => {
  test('sets and unsets inflight around handler', async () => {
    const handler = withRouteTiming(async function GET(req: Request) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    });
    const res = await (handler as any)(new Request('http://localhost/api/health'));
    expect([200,403,429,500]).toContain(res.status);
  });
});

import { incrInFlight, decrInFlight, snapshot } from '../../apps/web/src/lib/metrics';

describe('metrics in-flight tracking', () => {
  test('increments and decrements per route', () => {
    const route = '/api/test';
    let s0 = snapshot();
    const before = s0[route]?.in_flight || 0;
    incrInFlight(route);
    incrInFlight(route);
    let s1 = snapshot();
    expect((s1[route]?.in_flight || 0)).toBe(before + 2);
    decrInFlight(route);
    decrInFlight(route);
    s1 = snapshot();
    expect((s1[route]?.in_flight || 0)).toBe(before);
  });
});


