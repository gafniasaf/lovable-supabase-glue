// @ts-nocheck
import { assignment, assignmentCreateRequest, assignmentUpdateRequest } from '@shared';

describe('assignment schemas', () => {
  test('assignmentCreateRequest valid', () => {
    const v = assignmentCreateRequest.parse({
      course_id: '00000000-0000-0000-0000-000000000001',
      title: 'HW 1',
      description: 'Read and summarize',
      points: 50
    });
    expect(v.points).toBe(50);
  });

  test('assignmentUpdateRequest requires at least one field', () => {
    expect(() => assignmentUpdateRequest.parse({} as any)).toThrow();
    expect(() => assignmentUpdateRequest.parse({ title: 'New' })).not.toThrow();
  });

  test('assignment schema shape', () => {
    expect(() => assignment.parse({
      id: '00000000-0000-0000-0000-000000000001',
      course_id: '00000000-0000-0000-0000-000000000001',
      title: 'HW 1',
      description: null,
      due_at: null,
      points: 100,
      created_at: new Date().toISOString()
    })).not.toThrow();
  });
});


