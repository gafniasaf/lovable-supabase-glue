// @ts-nocheck
import { problem } from '@shared';

describe('Problem envelope schema', () => {
  test('validates shape with optional details', () => {
    const base = { code: 'BAD_REQUEST', message: 'Missing', requestId: 'req-1' };
    expect(() => problem.parse(base)).not.toThrow();
    expect(() => problem.parse({ ...base, details: { field: 'course_id' } })).not.toThrow();
  });

  test('unknown keys are tolerated (not strict)', () => {
    const v = problem.parse({ code: 'X', message: 'Y', requestId: 'id', extra: 1 } as any);
    expect(v.code).toBe('X');
    expect((v as any).extra).toBeUndefined();
  });
});


