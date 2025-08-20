import { parseQuery } from '../../apps/web/src/lib/zodQuery';
import { z } from 'zod';

describe('zodQuery.parseQuery', () => {
  test('parses from string and enforces strict schema', () => {
    const schema = z.object({ id: z.string(), limit: z.string().optional() }).strict();
    expect(() => parseQuery('http://localhost/api?limit=10&unknown=1&id=first&id=second', schema)).toThrow();
  });

  test('when multiple values for same key, last wins', () => {
    const schema = z.object({ id: z.string() }).strict();
    const value = parseQuery('http://localhost/api?id=first&id=second', schema) as any;
    expect(value.id).toBe('second');
  });
});


