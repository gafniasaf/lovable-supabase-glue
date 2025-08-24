describe('observability logs (services)', () => {
  const __LOGS__: any[] = [];
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    jest.resetModules();
    __LOGS__.splice(0);
    jest.doMock('@/lib/logger', () => ({
      logger: {
        info: (obj: any, msg: string) => __LOGS__.push({ level: 'info', msg, obj }),
        debug: (obj: any, msg: string) => __LOGS__.push({ level: 'debug', msg, obj }),
        error: (obj: any, msg: string) => __LOGS__.push({ level: 'error', msg, obj }),
        child: () => ({ info: (obj: any, msg: string) => __LOGS__.push({ level: 'info', msg, obj }), debug: (obj: any, msg: string) => __LOGS__.push({ level: 'debug', msg, obj }) })
      },
      getRequestLogger: (_requestId: string) => ({ info: (obj: any, msg: string) => __LOGS__.push({ level: 'info', msg, obj }), debug: (obj: any, msg: string) => __LOGS__.push({ level: 'debug', msg, obj }) }),
      __TEST_LOGS__: __LOGS__
    }), { virtual: true });
  });

  test('dash_teacher_widgets and dash_student_widgets include ms', async () => {
    const dashboardSvc = await import('../../apps/web/src/server/services/dashboard');
    const loggerMod = await import('@/lib/logger');
    const logs: any[] = (loggerMod as any).__TEST_LOGS__ || __LOGS__;
    if ((loggerMod as any).__TEST_LOGS__) (loggerMod as any).__TEST_LOGS__.splice(0); else __LOGS__.splice(0);
    await (dashboardSvc as any).getDashboardForUser('test-teacher-id', 'teacher');
    await (dashboardSvc as any).getDashboardForUser('test-student-id', 'student');
    const hasTeacher = logs.some(l => (l.msg === 'dash_teacher_widgets') && typeof l.obj?.ms === 'number');
    const hasStudent = logs.some(l => (l.msg === 'dash_student_widgets') && typeof l.obj?.ms === 'number');
    expect(hasTeacher).toBe(true);
    expect(hasStudent).toBe(true);
  });

  test('progress_marked counter emitted on completion', async () => {
    const progressSvc = await import('../../apps/web/src/server/services/progress');
    const loggerMod = await import('@/lib/logger');
    const logs: any[] = (loggerMod as any).__TEST_LOGS__ || __LOGS__;
    if ((loggerMod as any).__TEST_LOGS__) (loggerMod as any).__TEST_LOGS__.splice(0); else __LOGS__.splice(0);
    const out = await (progressSvc as any).markLessonComplete('u1', '00000000-0000-0000-0000-000000000001');
    expect(out.lessonId).toBeTruthy();
    const hasProgress = logs.some(l => (l.msg === 'progress_marked') && typeof l.obj?.ms === 'number');
    expect(hasProgress).toBe(true);
  });
});


