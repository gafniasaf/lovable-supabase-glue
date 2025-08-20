/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from '../../shims/msw';
import StudentStudyDigestPage from '@/app/labs/student/study-digest/page';

describe('Student Study Digest (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders digest cards with MSW jitter', async () => {
    server.use(
      http.get('/api/enrollments', async () => delayedJson([{ id: 'e-1', course_id: 'c-1' }], jitter(1, 10))),
      http.get('/api/lessons', async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('course_id') === 'c-1') {
          return delayedJson([
            { id: 'l-1', title: 'Intro', order_index: 1, content: 'abc' },
            { id: 'l-2', title: 'Next', order_index: 2, content: 'def' },
            { id: 'l-3', title: 'Later', order_index: 3, content: 'ghi' }
          ], jitter(1, 10));
        }
        return delayedJson([], jitter(1, 5));
      })
    );
    const ui = await StudentStudyDigestPage();
    render(ui);
    await screen.findByTestId('digest-grid');
  });
});


