import { createAnnouncementApi, listAnnouncementsByCourse, deleteAnnouncementApi } from '../../apps/web/src/server/services/announcements';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

describe('announcements service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('create and list announcements with publish filtering', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const teacherId = 'teacher-1';
    const now = new Date();
    const future = new Date(now.getTime() + 60_000).toISOString();

    await createAnnouncementApi({ course_id: courseId, title: 'Now', body: 'Visible now', publish_at: null } as any, teacherId);
    await createAnnouncementApi({ course_id: courseId, title: 'Later', body: 'Visible later', publish_at: future } as any, teacherId);

    const visible = await listAnnouncementsByCourse(courseId, false);
    expect(visible.map(a => a.title)).toContain('Now');
    expect(visible.map(a => a.title)).not.toContain('Later');

    const all = await listAnnouncementsByCourse(courseId, true);
    expect(all.map(a => a.title)).toEqual(expect.arrayContaining(['Now', 'Later']));
  });

  test('delete announcement returns ok', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const teacherId = 'teacher-1';
    const created = await createAnnouncementApi({ course_id: courseId, title: 'Del', body: 'x' } as any, teacherId);
    const res = await deleteAnnouncementApi(created.id);
    expect(res.ok).toBe(true);
  });
});


