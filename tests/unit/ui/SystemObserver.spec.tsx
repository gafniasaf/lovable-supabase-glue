/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from 'msw';
import ObserverPage from '@/app/labs/system/observer/page';

describe('System Observer (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders sample count and percentiles with jitter', async () => {
    server.use(http.get('/api/health', async () => delayedJson({ ok: true, ts: Date.now(), testMode: true }, jitter(1, 8))));
    const ui = await ObserverPage();
    render(ui);
    await screen.findByTestId('observer-sample-count');
    await screen.findByTestId('observer-min');
    await screen.findByTestId('observer-p50');
    await screen.findByTestId('observer-p95');
    await screen.findByTestId('observer-p99');
  });
});


