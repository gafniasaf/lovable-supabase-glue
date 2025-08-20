import { OPTIONS as SaveOPTIONS } from '../../apps/web/src/app/api/runtime/checkpoint/save/route';
import { OPTIONS as LoadOPTIONS } from '../../apps/web/src/app/api/runtime/checkpoint/load/route';

const opt = (url: string, origin: string) => new Request(url, { method: 'OPTIONS', headers: { origin } as any } as any);

describe('runtime checkpoint CORS preflight', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example' } as any; });
  afterEach(() => { process.env = original; });

  test('save OPTIONS returns 204 and allow-origin', async () => {
    const res = await (SaveOPTIONS as any)(opt('http://localhost/api/runtime/checkpoint/save', 'https://provider.example'));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://provider.example');
  });

  test('load OPTIONS returns 204 and allow-origin', async () => {
    const res = await (LoadOPTIONS as any)(opt('http://localhost/api/runtime/checkpoint/load', 'https://provider.example'));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://provider.example');
  });
});



