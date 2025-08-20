// @ts-nocheck
import { quizCreateRequest, quizUpdateRequest, quizQuestionCreateRequest, quizChoiceCreateRequest, quizAttemptStartRequest, quizAnswerUpsertRequest, quizAttemptSubmitRequest } from '@shared';

describe('quiz schemas', () => {
  test('quizCreateRequest valid', () => {
    const v = quizCreateRequest.parse({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Quiz 1', points: 100 });
    expect(v.title).toBe('Quiz 1');
  });
  test('quizUpdateRequest requires at least one field', () => {
    expect(() => quizUpdateRequest.parse({} as any)).toThrow();
  });
  test('question and choice valid', () => {
    const q = quizQuestionCreateRequest.parse({ quiz_id: '00000000-0000-0000-0000-000000000001', text: 'What?', order_index: 1 });
    expect(q.text).toBe('What?');
    const c = quizChoiceCreateRequest.parse({ question_id: '00000000-0000-0000-0000-000000000001', text: 'A', correct: true, order_index: 1 });
    expect(c.correct).toBe(true);
  });
  test('attempt schemas valid', () => {
    const s = quizAttemptStartRequest.parse({ quiz_id: '00000000-0000-0000-0000-000000000001' });
    expect(s.quiz_id).toBeTruthy();
    const a = quizAnswerUpsertRequest.parse({ attempt_id: '00000000-0000-0000-0000-000000000001', question_id: '00000000-0000-0000-0000-000000000002', choice_id: '00000000-0000-0000-0000-000000000003' });
    expect(a.choice_id).toBeTruthy();
    const sub = quizAttemptSubmitRequest.parse({ attempt_id: '00000000-0000-0000-0000-000000000001' });
    expect(sub.attempt_id).toBeTruthy();
  });
});


