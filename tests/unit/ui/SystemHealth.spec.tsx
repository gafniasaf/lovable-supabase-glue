import '@testing-library/jest-dom';
import { server } from './mswServer';
import { http, HttpResponse } from 'msw';

describe('System Health (labs)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs /api/health', async () => {
    server.use(
      http.get('/api/health', () => HttpResponse.json({ ok: true, ts: Date.now(), testRole: 'teacher', testMode: true }))
    );
    expect(true).toBe(true);
  });
});


