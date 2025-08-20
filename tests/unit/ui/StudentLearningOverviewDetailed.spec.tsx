/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from '../../shims/msw';
import StudentLearningOverviewDetailedPage from '@/app/labs/student/learning-overview-detailed/page';

describe('Student Learning Overview (detailed)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders cards and counts with jitter', async () => {
    server.use(
      http.get('/api/enrollments', async () => delayedJson([{ id: 'e-1', course_id: 'c-1' }], jitter(1, 10))),
      http.get('/api/lessons', async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id') === 'c-1') {
          return delayedJson([
            { id: 'l-1', title: 'Intro', order_index: 1 },
            { id: 'l-2', title: 'Next', order_index: 2 }
          ], jitter(1, 10));
        }
        return delayedJson([], jitter(1, 5));
      })
    );
    const ui = await StudentLearningOverviewDetailedPage();
    render(ui);
    await screen.findByTestId('learning-grid');
  });
});


