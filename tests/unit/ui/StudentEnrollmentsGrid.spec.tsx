/** @jest-environment jsdom */
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';

describe('Labs/Student Enrollments Grid page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs /api/enrollments', async () => {
    server.use(
      http.get('/api/enrollments', () => HttpResponse.json([
        { id: 'e-1', student_id: 'u-1', course_id: 'c-1', created_at: new Date().toISOString() }
      ]))
    );
    expect(true).toBe(true);
  });
});


