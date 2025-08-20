/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from 'msw';
import LatencySamplerPage from '@/app/labs/system/latency-sampler/page';

describe('System Latency Sampler (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders min/avg/max and sample count under jitter', async () => {
    server.use(http.get('/api/health', async () => delayedJson({ ok: true, ts: Date.now(), testMode: true }, jitter(3, 18))));
    const ui = await LatencySamplerPage();
    render(ui);
    await screen.findByTestId('latency-min');
    await screen.findByTestId('latency-avg');
    await screen.findByTestId('latency-max');
    await screen.findByTestId('latency-sample-count');
  });
});


