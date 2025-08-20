// @ts-nocheck
import { enrollment, enrollmentCreateRequest } from '@shared';

describe('enrollment schemas', () => {
  test('enrollment schema', () => {
    expect(() => enrollment.parse({
      id: '00000000-0000-0000-0000-000000000001',
      student_id: 'u1',
      course_id: '00000000-0000-0000-0000-000000000002',
      created_at: new Date().toISOString()
    })).not.toThrow();
  });

  test('enrollmentCreateRequest validates', () => {
    expect(() => enrollmentCreateRequest.parse({ course_id: '00000000-0000-0000-0000-000000000001' })).not.toThrow();
    expect(() => enrollmentCreateRequest.parse({ course_id: 'bad' } as any)).toThrow();
  });
});


