/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server, delayedJson, jitter } from './mswServer';
import { http } from 'msw';
import UptimeTilePage from '@/app/labs/system/uptime-tile/page';

describe('System Uptime Tile (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders ok and ts fields under jitter', async () => {
    const now = Date.now();
    server.use(http.get('/api/health', async () => delayedJson({ ok: true, ts: now, testRole: 'teacher', testMode: true }, jitter(1, 10))));
    const ui = await UptimeTilePage();
    render(ui);
    await screen.findByTestId('uptime-ok');
    await screen.findByTestId('uptime-ts-iso');
    await screen.findByTestId('uptime-ts-human');
  });
});


