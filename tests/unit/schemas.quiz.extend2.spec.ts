import { quizCreateRequest, quizUpdateRequest } from '@shared';

describe('quiz schema boundary values', () => {
  test('time_limit_sec boundaries and null', () => {
    expect(() => quizCreateRequest.parse({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Okay', time_limit_sec: 10 })).not.toThrow();
    expect(() => quizCreateRequest.parse({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Okay', time_limit_sec: 7200 })).not.toThrow();
    expect(() => quizCreateRequest.parse({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Okay', time_limit_sec: null as any })).not.toThrow();
    expect(() => quizUpdateRequest.parse({ time_limit_sec: 10 })).not.toThrow();
    expect(() => quizUpdateRequest.parse({ time_limit_sec: 7200 })).not.toThrow();
  });
});


