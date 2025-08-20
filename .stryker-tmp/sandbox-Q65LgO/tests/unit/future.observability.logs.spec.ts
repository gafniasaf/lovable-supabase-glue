// @ts-nocheck
import * as dashboardSvc from '../../apps/web/src/server/services/dashboard';
import * as progressSvc from '../../apps/web/src/server/services/progress';
import * as loggerMod from '../../apps/web/src/lib/logger';

jest.mock('../../apps/web/src/lib/logger', () => {
  const logs: any[] = [];
  const fake = {
    info: (obj: any, msg: string) => logs.push({ level: 'info', msg, obj }),
    debug: (obj: any, msg: string) => logs.push({ level: 'debug', msg, obj }),
    error: (obj: any, msg: string) => logs.push({ level: 'error', msg, obj }),
    child: () => fake
  } as any;
  return {
    logger: fake,
    getRequestLogger: (_requestId: string) => fake,
    __TEST_LOGS__: logs
  } as any;
});

describe('observability logs (services)', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('dash_teacher_widgets and dash_student_widgets include ms', async () => {
    const logs: any[] = (loggerMod as any).__TEST_LOGS__;
    logs.length = 0;
    await dashboardSvc.getDashboardForUser('test-teacher-id', 'teacher');
    await dashboardSvc.getDashboardForUser('test-student-id', 'student');
    expect(logs.some(l => l.msg === 'dash_teacher_widgets' && typeof l.obj?.ms === 'number')).toBe(true);
    expect(logs.some(l => l.msg === 'dash_student_widgets' && typeof l.obj?.ms === 'number')).toBe(true);
  });

  test('progress_marked counter emitted on completion', async () => {
    const logs: any[] = (loggerMod as any).__TEST_LOGS__;
    logs.length = 0;
    const out = await progressSvc.markLessonComplete('u1', '00000000-0000-0000-0000-000000000001');
    expect(out.lessonId).toBeTruthy();
    expect(logs.some(l => l.msg === 'progress_marked' && typeof l.obj?.ms === 'number')).toBe(true);
  });
});


