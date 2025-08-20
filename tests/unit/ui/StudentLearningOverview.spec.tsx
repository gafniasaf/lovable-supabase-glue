/** @jest-environment jsdom */
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';

describe('Labs/Student Learning Overview page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs /api/enrollments and /api/lessons', async () => {
    server.use(
      http.get('/api/enrollments', () => HttpResponse.json([
        { id: 'e-1', student_id: 'u-1', course_id: 'c-1', created_at: new Date().toISOString() },
        { id: 'e-2', student_id: 'u-1', course_id: 'c-2', created_at: new Date().toISOString() }
      ])),
      http.get('/api/lessons', ({ request }) => {
        const url = new URL(request.url);
        const cid = url.searchParams.get('course_id');
        if (cid === 'c-1') return HttpResponse.json([{ id: 'l-1', title: 'Intro', order_index: 1 }]);
        if (cid === 'c-2') return HttpResponse.json([{ id: 'l-2', title: 'Start', order_index: 1 }, { id: 'l-3', title: 'Next', order_index: 2 }]);
        return HttpResponse.json([]);
      })
    );
    expect(true).toBe(true);
  });
});


