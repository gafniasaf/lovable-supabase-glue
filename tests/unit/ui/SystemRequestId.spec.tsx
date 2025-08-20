/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { server } from './mswServer';
import { http } from 'msw';
import RequestIdPage from '@/app/labs/system/request-id/page';

describe('System Request ID (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders request-id from response headers when present', async () => {
    server.use(
      http.get('/api/health', () => new Response(JSON.stringify({ ok: true, ts: Date.now(), testMode: true }), { headers: { 'x-request-id': 'req-123' } }))
    );
    const ui = await RequestIdPage();
    render(ui);
    expect(await screen.findByTestId('request-id')).toHaveTextContent('req-123');
  });
});


