import { resetTestStore, addTestMessage, createTestThread, listTestMessagesByThread, markTestMessageReadForUser, addTestNotification, listTestNotificationsByUser, markAllTestNotificationsRead, addTestFile, getTestFile, countUnreadForThread, markAllThreadMessagesReadForUser, addQuestion, addQuiz, addChoice, deleteQuiz, listQuestionsByQuiz } from '../../apps/web/src/lib/testStore';

describe('testStore edge cases', () => {
  beforeEach(() => {
    resetTestStore();
  });

  test('messages create, list ordered, mark read and compute unread counts', () => {
    const t = createTestThread(['u1', 'u2']);
    const m1 = addTestMessage({ thread_id: t.id, sender_id: 'u1', body: 'a' });
    const m2 = addTestMessage({ thread_id: t.id, sender_id: 'u2', body: 'b' });
    const list = listTestMessagesByThread(t.id);
    expect(list.map((m: any) => m.id)).toEqual([m1.id, m2.id]);
    expect(countUnreadForThread(t.id, 'u2')).toBe(1); // m1 unread for u2
    const updated = markTestMessageReadForUser(m1.id, 'u2');
    expect(updated?.read_at).toBeTruthy();
    expect(countUnreadForThread(t.id, 'u2')).toBe(0);
    // mark all read for u1 (should ignore own messages)
    markAllThreadMessagesReadForUser(t.id, 'u1');
    expect(countUnreadForThread(t.id, 'u1')).toBe(0);
  });

  test('notifications add, list, and mark all read', () => {
    const n1 = addTestNotification({ user_id: 'u1', type: 't1' });
    const n2 = addTestNotification({ user_id: 'u1', type: 't2' });
    const list = listTestNotificationsByUser('u1');
    expect(list.map((n: any) => n.id)).toEqual([n2.id, n1.id]);
    const res = markAllTestNotificationsRead('u1');
    expect(res.ok).toBe(true);
    const after = listTestNotificationsByUser('u1');
    expect(after.every((n: any) => n.read_at)).toBe(true);
  });

  test('files add and get', () => {
    const f = addTestFile({ owner_type: 'assignment', owner_id: 'a1', content_type: 'text/plain', data_base64: 'ZGF0YQ==' });
    const g = getTestFile(f.id);
    expect(g?.data_base64).toBe('ZGF0YQ==');
  });

  test('quizzes: deleting a quiz cascades its questions', () => {
    const quiz = addQuiz({ course_id: 'c1', title: 'Q' });
    const q1 = addQuestion({ quiz_id: quiz.id, text: 'A1', order_index: 1 });
    addChoice({ question_id: q1.id, text: 'x', correct: true, order_index: 1 });
    expect(listQuestionsByQuiz(quiz.id).length).toBe(1);
    const res = deleteQuiz(quiz.id);
    expect(res.ok).toBe(true);
    expect(listQuestionsByQuiz(quiz.id).length).toBe(0);
  });
});


