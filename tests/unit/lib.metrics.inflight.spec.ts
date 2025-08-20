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


