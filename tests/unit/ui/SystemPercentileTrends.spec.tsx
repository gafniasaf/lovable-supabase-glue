/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from 'msw';
import PercentileTrendsPage from '@/app/labs/system/percentile-trends/page';

describe('System Percentile Trends (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders windows and overall sample count under jitter', async () => {
    server.use(http.get('/api/health', async () => delayedJson({ ok: true, ts: Date.now(), testMode: true }, jitter(5, 15))));
    const ui = await PercentileTrendsPage();
    render(ui);
    expect(await screen.findByTestId('trends-window-count')).toHaveTextContent('5');
    expect(await screen.findByTestId('trends-overall-sample-count')).toHaveTextContent('25');
    const rows = await screen.findAllByTestId('trends-window-row');
    expect(rows.length).toBe(5);
  });
});


