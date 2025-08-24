/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http, HttpResponse } from '../../shims/msw';
import HealthHistoryPage from '@/app/labs/system/health-history/page';

describe('System Health History (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders delta stats and timestamps with jitter', async () => {
    server.use(http.get('/api/health', () => HttpResponse.json({ ok: true, ts: Date.now(), testMode: true })));
    const ui = await HealthHistoryPage();
    render(ui);
    await screen.findByTestId('history-sample-count');
    await screen.findByTestId('history-min-delta');
    await screen.findByTestId('history-avg-delta');
    await screen.findByTestId('history-max-delta');
  });
});


