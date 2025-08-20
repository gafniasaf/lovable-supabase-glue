import { createQuizApi, listQuizzesByCourseApi, updateQuizApi, deleteQuizApi, createQuestionApi, listQuestionsByQuizApi, createChoiceApi, listChoicesByQuestionApi } from '../../apps/web/src/server/services/quizzes';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

describe('quizzes service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('quiz create/list/update/delete', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const q = await createQuizApi({ course_id: courseId, title: 'Quiz 1', points: 50 });
    let list = await listQuizzesByCourseApi(courseId);
    expect(list.map(x => x.id)).toContain(q.id);
    const upd = await updateQuizApi(q.id, { title: 'Quiz 1b', points: 60 });
    expect(upd?.title).toBe('Quiz 1b');
    const del = await deleteQuizApi(q.id);
    expect(del.ok).toBe(true);
    list = await listQuizzesByCourseApi(courseId);
    expect(list.map(x => x.id)).not.toContain(q.id);
  });

  test('question and choice flows', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const q = await createQuizApi({ course_id: courseId, title: 'Quiz 2' });
    const qu = await createQuestionApi({ quiz_id: q.id, text: 'Q1', order_index: 2 });
    await createQuestionApi({ quiz_id: q.id, text: 'Q0', order_index: 1 });
    const qs = await listQuestionsByQuizApi(q.id);
    expect(qs[0].text).toBe('Q0');
    const c1 = await createChoiceApi({ question_id: qu.id, text: 'A', correct: false, order_index: 2 });
    const c0 = await createChoiceApi({ question_id: qu.id, text: 'B', correct: true, order_index: 1 });
    const cs = await listChoicesByQuestionApi(qu.id);
    expect(cs.map(c => c.id)).toEqual([c0.id, c1.id]);
  });
});


