/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server } from './mswServer';
import { http, HttpResponse } from '../../shims/msw';
import AuthCheckPage from '@/app/labs/system/auth-check/page';

describe('System Auth Check (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders email and role when authenticated', async () => {
    // Ensure test-mode header is set to teacher for fallback paths
    // @ts-ignore
    (global as any).__TEST_HEADERS_STORE__ = (global as any).__TEST_HEADERS_STORE__ || { cookies: new Map(), headers: new Map() };
    // @ts-ignore
    (global as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    server.use(http.get('/api/user/profile', () => HttpResponse.json({ id: 'u1', email: 't@example.com', role: 'teacher' })));
    const ui = await AuthCheckPage();
    render(ui);
    expect(await screen.findByTestId('auth-email')).toHaveTextContent('t@example.com');
    expect(await screen.findByTestId('auth-role')).toHaveTextContent('teacher');
  });
});


