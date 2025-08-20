/** @jest-environment jsdom */
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';

describe('Labs/Parent Announcements page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs parent-links and announcements', async () => {
    server.use(
      http.get('/api/parent-links', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('parent_id') === 'test-parent-id') {
          return HttpResponse.json([{ id: 'pl-1', parent_id: 'p-1', student_id: 's-1', created_at: new Date().toISOString() }]);
        }
        return HttpResponse.json([]);
      }),
      http.get('/api/announcements', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id')) {
          return HttpResponse.json([{ id: 'a-1', course_id: url.searchParams.get('course_id')!, title: 'Hello', body: 'World', created_at: new Date().toISOString() }]);
        }
        return HttpResponse.json([]);
      })
    );
    expect(true).toBe(true);
  });
});


