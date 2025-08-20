/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from 'msw';
import DiagnosticsSuitePage from '@/app/labs/system/diagnostics-suite/page';

describe('System Diagnostics Suite (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders batch cards and overall stats under jitter', async () => {
    server.use(http.get('/api/health', async () => delayedJson({ ok: true, ts: Date.now(), testMode: true }, jitter(1, 10))));
    const ui = await DiagnosticsSuitePage();
    render(ui);
    for (const label of ['10', '20', '30']) {
      const card = await screen.findByTestId(`diag-batch-card-${label}`);
      within(card).getByTestId(`diag-batch-sample-count-${label}`);
      within(card).getByTestId(`diag-batch-min-${label}`);
      within(card).getByTestId(`diag-batch-avg-${label}`);
      within(card).getByTestId(`diag-batch-max-${label}`);
      within(card).getByTestId(`diag-batch-p50-${label}`);
      within(card).getByTestId(`diag-batch-p95-${label}`);
    }
    await screen.findByTestId('diag-overall-sample-count');
  });
});


