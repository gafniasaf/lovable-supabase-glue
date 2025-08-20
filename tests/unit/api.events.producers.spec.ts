import * as supa from '../helpers/supabaseMock';

describe('Event producers (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('lesson complete records event', async () => {
    const { markLessonComplete } = await import('../../apps/web/src/server/services/progress');
    const { getInMemoryEvents } = await import('../../apps/web/src/lib/events');
    await markLessonComplete('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-000000000111');
    const ev = getInMemoryEvents().find(e => e.event_type === 'lesson.complete');
    expect(ev).toBeTruthy();
  });

  test('submission create and grade records events', async () => {
    const { createSubmissionApi, gradeSubmissionApi } = await import('../../apps/web/src/server/services/submissions');
    const { getInMemoryEvents } = await import('../../apps/web/src/lib/events');
    const sub = await createSubmissionApi({ assignment_id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000222', text: '' } as any, '22222222-2222-2222-2222-222222222222');
    const createEv = getInMemoryEvents().find(e => e.event_type === 'assignment.submit');
    expect(createEv).toBeTruthy();
    await gradeSubmissionApi(sub.id, { score: 95 }, '11111111-1111-1111-1111-111111111111');
    const gradeEv = getInMemoryEvents().find(e => e.event_type === 'assignment.graded');
    expect(gradeEv).toBeTruthy();
  });
});


