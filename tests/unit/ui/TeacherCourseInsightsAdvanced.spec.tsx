/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from '../../shims/msw';
import TeacherCourseInsightsAdvancedPage from '@/app/labs/teacher/course-insights-advanced/page';

describe('Teacher Course Insights (Advanced)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders table and totals with jitter', async () => {
    server.use(
      http.get('/api/courses', async () => delayedJson([{ id: 'c-1', title: 'Course 1' }], jitter(1, 8))),
      http.get('/api/lessons', async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id') === 'c-1') {
          return delayedJson([
            { id: 'l-1', title: 'Start', order_index: 1 },
            { id: 'l-2', title: 'End', order_index: 2 }
          ], jitter(1, 8));
        }
        return delayedJson([], jitter(1, 3));
      })
    );
    const ui = await TeacherCourseInsightsAdvancedPage();
    render(ui);
    await screen.findByTestId('insights-table');
    await screen.findByTestId('insights-total-courses');
    await screen.findByTestId('insights-total-lessons');
  });
});


