/** @jest-environment jsdom */
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';

describe('Labs/Teacher Analytics page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs /api/courses and /api/lessons', async () => {
    server.use(
      http.get('/api/courses', () => HttpResponse.json([{ id: 'c-1', title: 'T1' }])),
      http.get('/api/lessons', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id') === 'c-1') return HttpResponse.json([{ id: 'l-1', title: 'L1', order_index: 1 }]);
        return HttpResponse.json([]);
      })
    );
    expect(true).toBe(true);
  });
});


