/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from 'msw';
import ThroughputProfilerPage from '@/app/labs/system/throughput-profiler/page';

describe('System Throughput Profiler (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders bursts with counts and metrics under variable latency', async () => {
    server.use(
      http.get('/api/health', async () => delayedJson({ ok: true, ts: Date.now(), testMode: true }, jitter(5, 25)))
    );
    // Render server component by invoking default export (pure function) and asserting on its output
    const ui = await ThroughputProfilerPage();
    render(ui);
    // overall bursts count
    expect(await screen.findByTestId('tp-overall-bursts')).toHaveTextContent('4');
    // each burst card shows sample count
    for (const size of [5, 10, 20, 40]) {
      const card = await screen.findByTestId(`tp-burst-card-${size}`);
      expect(within(card).getByTestId(`tp-burst-sample-count-${size}`)).toHaveTextContent(String(size));
      // basic fields present
      within(card).getByTestId(`tp-burst-min-${size}`);
      within(card).getByTestId(`tp-burst-avg-${size}`);
      within(card).getByTestId(`tp-burst-max-${size}`);
      within(card).getByTestId(`tp-burst-p50-${size}`);
      within(card).getByTestId(`tp-burst-p95-${size}`);
    }
  });
});


