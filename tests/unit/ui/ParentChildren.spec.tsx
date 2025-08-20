/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server } from './mswServer';
import { http, HttpResponse } from '../../shims/msw';
import ParentChildrenListPage from '@/app/labs/parent/children/page';

describe('Parent Children (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders list with one linked student', async () => {
    server.use(http.get('/api/parent-links', () => HttpResponse.json([{ id: 'pl-1', parent_id: 'p-1', student_id: 's-1', created_at: new Date().toISOString() }])));
    const ui = await ParentChildrenListPage();
    render(ui);
    await screen.findByTestId('children-list');
  });
});


