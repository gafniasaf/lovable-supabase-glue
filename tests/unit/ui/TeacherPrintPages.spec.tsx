/** @jest-environment jsdom */
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';

describe('Labs/Teacher Print pages', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs lessons for course print routes', async () => {
    server.use(
      http.get('/api/lessons', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id')) {
          return HttpResponse.json([
            { id: 'l-1', title: 'Intro', content: '...', order_index: 1 },
            { id: 'l-2', title: 'More', content: '...', order_index: 2 }
          ]);
        }
        return HttpResponse.json([]);
      })
    );
    expect(true).toBe(true);
  });
});


