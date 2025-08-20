import { serverFetch } from '../../apps/web/src/lib/serverFetch';

describe('serverFetch extended', () => {
  test('absolute URL passes through unchanged', async () => {
    const old = global.fetch;
    const calls: any[] = [];
    // @ts-ignore
    global.fetch = async (url: any, init?: any) => { calls.push({ url, init }); return new Response('ok'); };
    try {
      await serverFetch('http://example.com/api/x');
      expect(calls[0].url).toBe('http://example.com/api/x');
    } finally {
      global.fetch = old;
    }
  });

  test('caller x-request-id overrides upstream header', async () => {
    const old = global.fetch;
    const calls: any[] = [];
    // @ts-ignore
    global.fetch = async (url: any, init?: any) => { calls.push({ url, init }); return new Response('ok'); };
    try {
      // @ts-ignore
      globalThis.__TEST_HEADERS_STORE__.headers.set('x-request-id', 'upstream');
      await serverFetch('/api/demo', { headers: { 'x-request-id': 'caller' } });
      const h = calls[0].init.headers as Headers;
      expect(h.get('x-request-id')).toBe('caller');
    } finally {
      global.fetch = old;
    }
  });
});


