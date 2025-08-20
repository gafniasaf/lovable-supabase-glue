import { getBaseUrl } from '../../apps/web/src/lib/serverFetch';

describe('serverFetch base URL', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original }; });
  afterEach(() => { process.env = original; });

  test('prefers PLAYWRIGHT_BASE_URL over NEXT_PUBLIC_BASE_URL and PORT', () => {
    process.env.PLAYWRIGHT_BASE_URL = 'http://e2e:1234';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://public:5678';
    process.env.PORT = '9999';
    expect(getBaseUrl()).toBe('http://e2e:1234');
  });

  test('falls back to NEXT_PUBLIC_BASE_URL, else http://localhost:PORT', () => {
    delete process.env.PLAYWRIGHT_BASE_URL;
    process.env.NEXT_PUBLIC_BASE_URL = 'http://public:5678';
    expect(getBaseUrl()).toBe('http://public:5678');
    delete process.env.NEXT_PUBLIC_BASE_URL;
    process.env.PORT = '3030';
    expect(getBaseUrl()).toBe('http://localhost:3030');
  });
});


