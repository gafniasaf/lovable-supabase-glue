import { GET as EngagementGET } from '../../apps/web/src/app/api/reports/engagement/route';
import { GET as DistGET } from '../../apps/web/src/app/api/reports/grade-distribution/route';

function makeGet(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'GET', headers }); }

describe('API /api/reports/* (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('engagement: unauth → 401; missing course_id → 400', async () => {
    let res = await (EngagementGET as any)(makeGet('http://localhost/api/reports/engagement'));
    expect(res.status).toBe(401);
    // teacher, missing param
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    res = await (EngagementGET as any)(makeGet('http://localhost/api/reports/engagement'));
    expect(res.status).toBe(400);
  });

  test('grade-distribution: unauth → 401; missing course_id → 400; csv content-type', async () => {
    let res = await (DistGET as any)(makeGet('http://localhost/api/reports/grade-distribution'));
    expect(res.status).toBe(401);
    // teacher, missing param -> 400
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    res = await (DistGET as any)(makeGet('http://localhost/api/reports/grade-distribution'));
    expect(res.status).toBe(400);
    // with course_id and csv format
    res = await (DistGET as any)(makeGet('http://localhost/api/reports/grade-distribution?course_id=00000000-0000-0000-0000-000000000111&format=csv'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type') || '').toContain('text/csv');
  });
});

import { addTestAssignment, addTestSubmission, resetTestStore } from '../../apps/web/src/lib/testStore';

describe('Reports APIs', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
    // auth
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
  });

  test('engagement report returns counts for lessons/assignments/submissions', async () => {
    const route = await import('../../apps/web/src/app/api/reports/engagement/route');
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000555';
    // seed one assignment and one submission to it
    addTestAssignment({ id: 'as1', course_id: courseId, title: 'A', description: null, due_at: null, points: 100, created_at: new Date().toISOString() } as any);
    addTestSubmission({ id: 'sb1', assignment_id: 'as1', student_id: 's1', text: '', file_url: null, submitted_at: new Date().toISOString(), score: 90, feedback: null } as any);
    // lessons count is sourced from lessons table in prod, from testStore in test-mode; add a lesson to reflect non-zero lessons
    const { addTestLesson } = await import('../../apps/web/src/lib/testStore');
    addTestLesson({ id: 'l-eng-1', course_id: courseId, title: 'L', content: '', order_index: 1, created_at: new Date().toISOString() } as any);
    const res = await route.GET(new Request(`http://localhost/api/reports/engagement?course_id=${courseId}`, { headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.assignments).toBe(1);
    expect(json.submissions).toBe(1);
    expect(json.lessons).toBe(1);
  });

  test('grade-distribution returns JSON and CSV', async () => {
    const route = await import('../../apps/web/src/app/api/reports/grade-distribution/route');
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000666';
    addTestAssignment({ id: 'as2', course_id: courseId, title: 'A', description: null, due_at: null, points: 100, created_at: new Date().toISOString() } as any);
    addTestSubmission({ id: 'sb2', assignment_id: 'as2', student_id: 's1', text: '', file_url: null, submitted_at: new Date().toISOString(), score: 75, feedback: null } as any);
    addTestSubmission({ id: 'sb3', assignment_id: 'as2', student_id: 's2', text: '', file_url: null, submitted_at: new Date().toISOString(), score: 92, feedback: null } as any);
    // JSON
    let res = await route.GET(new Request(`http://localhost/api/reports/grade-distribution?course_id=${courseId}`, { headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(2);
    // CSV
    res = await route.GET(new Request(`http://localhost/api/reports/grade-distribution?course_id=${courseId}&format=csv`, { headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.split('\n')[0]).toBe('bucket,count');
  });
});


