import { createHealthGateway } from '@/lib/data/health';

describe('HealthGateway', () => {
  const original = { ...process.env } as any;
  beforeEach(() => { process.env = { ...original, TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = original as any; });

  test('get() returns ok, ts shape', async () => {
    const restore = mockFetch(async (input, init) => {
      const url = typeof input === 'string' ? input : String(input);
      if (url.endsWith('/api/health')) {
        return new (global as any).Response(JSON.stringify({ ok: true, ts: Date.now(), testMode: true }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new (global as any).Response('{}', { status: 404 });
    });
    const out = await createHealthGateway().get();
    expect(typeof out.ok).toBe('boolean');
    expect(typeof out.ts).toBe('number');
    restore();
  });
});

function mockFetch(fn: (input: RequestInfo, init?: RequestInit) => Promise<any>) {
  const original = (global as any).fetch;
  const ResponseCtor = (global as any).Response || class {
    body: any; status: number; headers: any; ok: boolean; constructor(body: any, init: any) { this.body = body; this.status = init?.status || 200; this.headers = new Map(Object.entries(init?.headers || {})); this.ok = this.status >= 200 && this.status < 300; }
    async json() { try { return JSON.parse(this.body); } catch { return this.body; } }
    async text() { return String(this.body); }
  } as any;
  (global as any).Response = ResponseCtor;
  (global as any).fetch = jest.fn(fn);
  return () => { (global as any).fetch = original; };
}


