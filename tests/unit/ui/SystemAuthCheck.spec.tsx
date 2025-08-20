/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';
import AuthCheckPage from '@/app/labs/system/auth-check/page';

describe('System Auth Check (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders email and role when authenticated', async () => {
    server.use(http.get('/api/user/profile', () => HttpResponse.json({ id: 'u1', email: 't@example.com', role: 'teacher' })));
    const ui = await AuthCheckPage();
    render(ui);
    expect(await screen.findByTestId('auth-email')).toHaveTextContent('t@example.com');
    expect(await screen.findByTestId('auth-role')).toHaveTextContent('teacher');
  });
});


