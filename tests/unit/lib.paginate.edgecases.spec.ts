import { parseTotalCount, toQuery } from '../../apps/web/src/lib/paginate';

describe('paginate helpers edge cases', () => {
  test('toQuery clamps defaults for undefined', () => {
    const qs = toQuery();
    expect(qs).toBe('?offset=0&limit=50');
  });

  test('parseTotalCount returns undefined for invalid values', () => {
    const h = new Headers();
    expect(parseTotalCount(h)).toBeUndefined();
    h.set('x-total-count', '-1');
    expect(parseTotalCount(h)).toBeUndefined();
    h.set('x-total-count', 'abc');
    expect(parseTotalCount(h)).toBeUndefined();
    h.set('x-total-count', '10');
    expect(parseTotalCount(h)).toBe(10);
  });
});


