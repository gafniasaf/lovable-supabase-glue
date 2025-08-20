// @ts-nocheck
import { POST as LessonsPOST, GET as LessonsGET } from '../../apps/web/src/app/api/lessons/route';

function makePost(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/lessons', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function makeGet(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers });
}

describe('API /api/lessons', () => {
  beforeEach(() => { jest.restoreAllMocks(); (process.env as any).TEST_MODE = '1'; });

  test('GET without course_id → 400 Problem', async () => {
    const res = await (LessonsGET as any)(makeGet('http://localhost/api/lessons', { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
  });

  test('POST validate title min length (<3) → 400', async () => {
    (process.env as any).TEST_MODE = '1';
    const res = await (LessonsPOST as any)(makePost({ course_id: 'c1', title: 'aa', content: '', order_index: 1 }, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
  });
});


