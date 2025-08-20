/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson } from './mswServer';
import { http } from 'msw';
import SystemOkCardPage from '@/app/labs/system/ok-card/page';

describe('System OK Card (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders ok and ts (human) on success', async () => {
    const now = Date.now();
    server.use(http.get('/api/health', async () => delayedJson({ ok: true, ts: now, testRole: 'teacher', testMode: true }, 5)));
    const ui = await SystemOkCardPage();
    render(ui);
    expect(await screen.findByTestId('ok-value')).toHaveTextContent('true');
    await screen.findByTestId('ts-human');
  });
});


