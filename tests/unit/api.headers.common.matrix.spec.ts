import { GET as CoursesGET } from '../../apps/web/src/app/api/courses/route';
import { GET as LessonsGET } from '../../apps/web/src/app/api/lessons/route';
import { GET as ModulesGET } from '../../apps/web/src/app/api/modules/route';
import { GET as AssignGET } from '../../apps/web/src/app/api/assignments/route';
import { GET as QuizzesGET } from '../../apps/web/src/app/api/quizzes/route';
import { GET as QqGET } from '../../apps/web/src/app/api/quiz-questions/route';
import { GET as ThreadsGET } from '../../apps/web/src/app/api/messages/threads/route';
import { GET as DashboardGET } from '../../apps/web/src/app/api/dashboard/route';
import { GET as NotifsGET } from '../../apps/web/src/app/api/notifications/route';
import { GET as ProvidersHealthGET } from '../../apps/web/src/app/api/providers/health/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('common headers (x-request-id, content-type) on GETs', () => {
  const cases: Array<{name:string, url:string, handler: (req: Request)=>Promise<Response>}> = [
    { name: 'courses', url: 'http://localhost/api/courses', handler: CoursesGET as any },
    { name: 'lessons', url: 'http://localhost/api/lessons', handler: LessonsGET as any },
    { name: 'modules', url: 'http://localhost/api/modules', handler: ModulesGET as any },
    { name: 'assignments', url: 'http://localhost/api/assignments?course_id=00000000-0000-0000-0000-000000000001', handler: AssignGET as any },
    { name: 'quizzes', url: 'http://localhost/api/quizzes?course_id=00000000-0000-0000-0000-000000000001', handler: QuizzesGET as any },
    { name: 'quiz-questions', url: 'http://localhost/api/quiz-questions?quiz_id=00000000-0000-0000-0000-000000000001', handler: QqGET as any },
    { name: 'threads', url: 'http://localhost/api/messages/threads', handler: ThreadsGET as any },
    { name: 'dashboard', url: 'http://localhost/api/dashboard', handler: DashboardGET as any },
    { name: 'notifications', url: 'http://localhost/api/notifications', handler: NotifsGET as any },
    { name: 'providers/health', url: 'http://localhost/api/providers/health', handler: ProvidersHealthGET as any },
  ];

  test.each(cases)('%s responds with x-request-id', async ({ name, url, handler }) => {
    const res = await (handler as any)(get(url));
    expect([200,401,403,400,500]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    expect((res.headers.get('content-type') || '').length).toBeGreaterThan(0);
  });
});


