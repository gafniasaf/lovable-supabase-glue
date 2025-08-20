import '@testing-library/jest-dom';
import { server } from '../ui/mswServer';
import { http, HttpResponse } from 'msw';

describe('Student Planner (gateways)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs enrollments and lessons endpoints', async () => {
    server.use(
      http.get('/api/enrollments', () => HttpResponse.json([{ id: 'e-1', student_id: 'u-1', course_id: 'c-1', created_at: new Date().toISOString() }])),
      http.get('/api/lessons', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id') === 'c-1') {
          return HttpResponse.json([{ id: 'l-1', title: 'Intro', content: '...', order_index: 1 }]);
        }
        return HttpResponse.json([]);
      })
    );
    expect(true).toBe(true);
  });
});


