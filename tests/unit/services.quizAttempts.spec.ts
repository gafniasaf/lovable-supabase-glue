import { startAttemptApi, upsertAnswerApi, submitAttemptApi, listAttemptsForQuiz, getAttemptForStudent } from '../../apps/web/src/server/services/quizAttempts';
import { createQuizApi, createQuestionApi, createChoiceApi } from '../../apps/web/src/server/services/quizzes';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

describe('quizAttempts service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('start, answer, submit computes score and lists attempts', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const quiz = await createQuizApi({ course_id: courseId, title: 'Quiz', points: 100 });
    const q1 = await createQuestionApi({ quiz_id: quiz.id, text: 'Q1', order_index: 1 });
    const q2 = await createQuestionApi({ quiz_id: quiz.id, text: 'Q2', order_index: 2 });
    const q1c1 = await createChoiceApi({ question_id: q1.id, text: 'A', correct: true, order_index: 1 });
    const q1c2 = await createChoiceApi({ question_id: q1.id, text: 'B', correct: false, order_index: 2 });
    const q2c1 = await createChoiceApi({ question_id: q2.id, text: 'A', correct: false, order_index: 1 });
    const q2c2 = await createChoiceApi({ question_id: q2.id, text: 'B', correct: true, order_index: 2 });

    const studentId = 'student-1';
    const attempt = await startAttemptApi({ quiz_id: quiz.id, student_id: studentId });
    await upsertAnswerApi({ attempt_id: attempt.id, question_id: q1.id, choice_id: q1c1.id });
    await upsertAnswerApi({ attempt_id: attempt.id, question_id: q2.id, choice_id: q2c1.id });
    const submitted = await submitAttemptApi({ attempt_id: attempt.id });
    expect(submitted?.score).toBe(50);

    const list = await listAttemptsForQuiz(quiz.id);
    expect(list.map(a => a.id)).toContain(attempt.id);
    const mine = await getAttemptForStudent(quiz.id, studentId);
    expect(mine?.id).toBe(attempt.id);
  });

  test('submit with zero answers yields score 0', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000124';
    const quiz = await createQuizApi({ course_id: courseId, title: 'Empty Quiz', points: 100 });
    const q1 = await createQuestionApi({ quiz_id: quiz.id, text: 'Q1', order_index: 1 });
    await createChoiceApi({ question_id: q1.id, text: 'A', correct: true, order_index: 1 });
    const studentId = 'student-2';
    const attempt = await startAttemptApi({ quiz_id: quiz.id, student_id: studentId });
    const submitted = await submitAttemptApi({ attempt_id: attempt.id });
    expect(submitted?.score).toBe(0);
  });
});


