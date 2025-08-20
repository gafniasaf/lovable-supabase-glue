import { markLessonCompleteRequest, progressResponse, courseProgress } from '@shared';

describe('progress schemas', () => {
  test('MarkLessonCompleteRequest completed defaults to true', () => {
    const v = markLessonCompleteRequest.parse({ lessonId: '00000000-0000-0000-0000-000000000001' });
    expect(v.completed).toBe(true);
  });

  test('per-student aggregate shape via courseProgress and response', () => {
    const cp = courseProgress.parse({
      courseId: '00000000-0000-0000-0000-000000000001',
      totalLessons: 10,
      completedLessons: 3,
      percent: 30
    });
    expect(cp.percent).toBe(30);
    const resp = progressResponse.parse({ courseProgress: cp, latest: { lessonId: '00000000-0000-0000-0000-000000000002', completedAt: new Date().toISOString() } });
    expect(resp.latest?.lessonId).toBeDefined();
  });
});


