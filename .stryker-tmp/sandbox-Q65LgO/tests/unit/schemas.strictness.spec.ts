// @ts-nocheck
import { assignmentCreateRequest, assignmentUpdateRequest, courseCreateRequest } from "@education/shared";

describe('schema strictness', () => {
  test('assignmentCreateRequest rejects unknown keys', () => {
    const r = assignmentCreateRequest.safeParse({ course_id: '00000000-0000-0000-0000-000000000123', title: 'A', extra: true });
    expect(r.success).toBe(false);
  });
  test('assignmentUpdateRequest rejects empty and unknown keys', () => {
    expect(assignmentUpdateRequest.safeParse({}).success).toBe(false);
    expect(assignmentUpdateRequest.safeParse({ extra: 1 }).success).toBe(false);
  });
  test('courseCreateRequest rejects unknown keys', () => {
    expect(courseCreateRequest.safeParse({ title: 'X', extra: 1 }).success).toBe(false);
  });
});


