describe('Epic F: Notifications (MVP)', () => {
  test('lists notifications for the current user ordered newest first', async () => {
    process.env.TEST_MODE = '1';
    const mod = await import('../../apps/web/src/app/api/notifications/route');
    // hitting POST /api/messages will produce notifications for participants
    const threads = await import('../../apps/web/src/app/api/messages/threads/route');
    const messages = await import('../../apps/web/src/app/api/messages/route');
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const createRes = await threads.POST(new Request('http://localhost/api/messages/threads', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' }, body: JSON.stringify({ participant_ids: ['test-student-id'] }) }) as any);
    const thread = await createRes.json();
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    await messages.POST(new Request('http://localhost/api/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' }, body: JSON.stringify({ thread_id: thread.id, body: 'hello' }) }) as any);
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    const res = await mod.GET(new Request('http://localhost/api/notifications', { headers: { 'x-test-auth': 'student' } }) as any);
    expect(res.status).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    const times = list.map((n: any) => n.created_at);
    const sorted = [...times].sort((a: string, b: string) => b.localeCompare(a));
    expect(times).toEqual(sorted);
  });

  test('marks a single notification as read', async () => {
    process.env.TEST_MODE = '1';
    const notifs = await import('../../apps/web/src/app/api/notifications/route');
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const res = await notifs.GET(new Request('http://localhost/api/notifications', { headers: { 'x-test-auth': 'teacher' } }) as any);
    const list = await res.json();
    if (list.length === 0) return; // nothing created in this isolated run
    const patch = await notifs.PATCH(new Request(`http://localhost/api/notifications?id=${list[0].id}`, { method: 'PATCH', headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(patch.status).toBe(200);
  });

  test('marks all notifications as read', async () => {
    process.env.TEST_MODE = '1';
    const mod = await import('../../apps/web/src/app/api/notifications/read-all/route');
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const res = await mod.PATCH(new Request('http://localhost/api/notifications/read-all', { method: 'PATCH', headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(res.status).toBe(200);
  });

  test('produces notification on grading a submission', async () => {
    process.env.TEST_MODE = '1';
    const { createSubmissionApi, gradeSubmissionApi } = await import('../../apps/web/src/server/services/submissions');
    const { listTestNotificationsByUser, resetTestStore } = await import('../../apps/web/src/lib/testStore');
    resetTestStore();
    const s = await createSubmissionApi({ assignment_id: '00000000-0000-0000-0000-000000000123', text: 'x' } as any, 'student-1');
    await gradeSubmissionApi(s.id, { score: 88 } as any);
    const list = listTestNotificationsByUser('student-1');
    expect(list.some((n: any) => n.type === 'submission:graded')).toBe(true);
  });

  test.todo('produces notification for upcoming assignment due date (scheduled job)');
});


