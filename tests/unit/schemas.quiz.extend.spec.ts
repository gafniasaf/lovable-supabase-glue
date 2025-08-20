import { quizCreateRequest, quizUpdateRequest } from '@shared';

describe('quiz schema bounds and fields', () => {
  test('time_limit_sec bounds respected', () => {
    expect(() => quizCreateRequest.parse({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Q', time_limit_sec: 9 } as any)).toThrow();
    expect(() => quizCreateRequest.parse({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Quiz ok', time_limit_sec: 10 })).not.toThrow();
    expect(() => quizUpdateRequest.parse({ time_limit_sec: 7201 })).toThrow();
  });
});


