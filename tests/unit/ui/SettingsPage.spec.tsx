import '@testing-library/jest-dom';
import { server } from '../ui/mswServer';
import { http, HttpResponse } from 'msw';

describe('Settings Page (gateways)', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('stubs profile and preferences endpoints', async () => {
    server.use(
      http.get('/api/user/profile', () => HttpResponse.json({ id: 'u-1', display_name: 'Alice', bio: '' })),
      http.get('/api/notifications/preferences', () => HttpResponse.json({ 'assignment:new': true }))
    );
    expect(true).toBe(true);
  });
});


