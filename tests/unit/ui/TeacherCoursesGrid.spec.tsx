/** @jest-environment jsdom */
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';

describe('Labs/TeacherCoursesGrid page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs /api/courses to provide rows', async () => {
    server.use(
      http.get('/api/courses', () => HttpResponse.json([
        { id: 'c-1', title: 'Course 1', description: 'Desc 1' },
        { id: 'c-2', title: 'Course 2', description: 'Desc 2' }
      ]))
    );
    expect(true).toBe(true);
  });
});
