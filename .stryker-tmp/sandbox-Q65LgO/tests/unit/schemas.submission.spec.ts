// @ts-nocheck
import { submission, submissionCreateRequest, submissionGradeRequest } from '@shared';

describe('submission schemas', () => {
  test('submission schema', () => {
    expect(() => submission.parse({
      id: '00000000-0000-0000-0000-000000000001',
      assignment_id: '00000000-0000-0000-0000-000000000002',
      student_id: '00000000-0000-0000-0000-000000000003',
      text: 'Hi',
      file_url: null,
      submitted_at: new Date().toISOString(),
      score: null,
      feedback: null
    })).not.toThrow();
  });

  test('submissionCreateRequest validates', () => {
    expect(() => submissionCreateRequest.parse({ assignment_id: '00000000-0000-0000-0000-000000000001', text: '' })).not.toThrow();
    expect(() => submissionCreateRequest.parse({ assignment_id: 'bad' } as any)).toThrow();
  });

  test('submissionGradeRequest validates range', () => {
    expect(() => submissionGradeRequest.parse({ score: 0 })).not.toThrow();
    expect(() => submissionGradeRequest.parse({ score: 1000 })).not.toThrow();
    expect(() => submissionGradeRequest.parse({ score: -1 } as any)).toThrow();
  });
});


