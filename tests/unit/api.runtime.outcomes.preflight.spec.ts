import { OPTIONS as OutcomesOPTIONS } from '../../apps/web/src/app/api/runtime/outcomes/route';

const opt = (url: string, origin: string) => new Request(url, { method: 'OPTIONS', headers: { origin } as any } as any);

describe('runtime outcomes CORS preflight', () => {
  const original = { ...process.env } as any;
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example' } as any; });
  afterEach(() => { process.env = original; });

  test('OPTIONS returns 204, Vary: Origin and ACAO for allowed origin', async () => {
    const res = await (OutcomesOPTIONS as any)(opt('http://localhost/api/runtime/outcomes', 'https://provider.example'));
    expect(res.status).toBe(204);
    expect(res.headers.get('vary')).toBe('Origin');
    expect(res.headers.get('access-control-allow-origin')).toBe('https://provider.example');
  });
});



