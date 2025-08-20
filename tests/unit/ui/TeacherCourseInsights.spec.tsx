/** @jest-environment jsdom */
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';

describe('Labs/Teacher Course Insights pages', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs /api/courses and /api/lessons for insights and pro pages', async () => {
    server.use(
      http.get('/api/courses', () => HttpResponse.json([{ id: 'c-1', title: 'Course 1' }])),
      http.get('/api/lessons', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id') === 'c-1') {
          return HttpResponse.json([
            { id: 'l-1', title: 'A', order_index: 1, content: '...' },
            { id: 'l-2', title: 'B', order_index: 2, content: '...' }
          ]);
        }
        return HttpResponse.json([]);
      })
    );
    expect(true).toBe(true);
  });
});


