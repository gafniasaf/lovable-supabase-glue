import { OPTIONS as AssetOPTIONS } from '../../apps/web/src/app/api/runtime/asset/sign-url/route';

const opt = (url: string, origin: string) => new Request(url, { method: 'OPTIONS', headers: { origin } as any } as any);

describe('runtime asset sign-url CORS preflight', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example' } as any; });
  afterEach(() => { process.env = original; });

  test('OPTIONS returns 204 and access-control-allow-origin for allowed origin', async () => {
    const res = await (AssetOPTIONS as any)(opt('http://localhost/api/runtime/asset/sign-url', 'https://provider.example'));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://provider.example');
  });
});



