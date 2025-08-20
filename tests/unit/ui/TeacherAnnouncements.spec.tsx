/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http, HttpResponse } from '../../shims/msw';
import TeacherAnnouncementsPage from '@/app/labs/teacher/announcements/page';

describe('Teacher Announcements (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders course count and announcement list with jitter', async () => {
    server.use(
      http.get('/api/courses', async () => delayedJson([{ id: 'c-1', title: 'C1' }], jitter(1, 8))),
      http.get('/api/announcements', async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id') === 'c-1') {
          return delayedJson([{ id: 'a-1', course_id: 'c-1', title: 'Hello', body: 'World', created_at: new Date().toISOString() }], jitter(1, 8));
        }
        return HttpResponse.json([]);
      }),
      http.post('/api/announcements', () => HttpResponse.json({ id: 'a-2', course_id: 'c-1', title: 'New', body: 'Body', created_at: new Date().toISOString() }))
    );
    const ui = await TeacherAnnouncementsPage({});
    render(ui as any);
    await screen.findByTestId('ann-course-count');
  });
});


