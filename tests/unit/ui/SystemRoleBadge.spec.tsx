/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server } from './mswServer';
import { http, HttpResponse } from '../../shims/msw';
import SystemRoleBadgePage from '@/app/labs/system/role-badge/page';

describe('System Role Badge (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders role and test mode', async () => {
    server.use(http.get('/api/health', () => HttpResponse.json({ ok: true, ts: Date.now(), testRole: 'teacher', testMode: true })));
    const ui = await SystemRoleBadgePage();
    render(ui);
    expect(await screen.findByTestId('role-value')).toHaveTextContent('teacher');
    expect(await screen.findByTestId('test-mode-value')).toHaveTextContent('true');
  });
});


