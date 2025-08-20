import { courseCreateRequest, courseUpdateRequest } from '@shared';

describe('course schemas', () => {
  test('courseCreateRequest validates fields', () => {
    expect(() => courseCreateRequest.parse({ title: 'Algebra', description: null })).not.toThrow();
    expect(() => courseCreateRequest.parse({ title: 'A' } as any)).toThrow();
  });

  test('courseUpdateRequest requires at least one field', () => {
    expect(() => courseUpdateRequest.parse({} as any)).toThrow();
    expect(() => courseUpdateRequest.parse({ title: 'New' })).not.toThrow();
  });
});


