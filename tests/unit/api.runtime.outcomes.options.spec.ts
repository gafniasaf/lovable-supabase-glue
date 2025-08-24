import { OPTIONS as OutcomesOptions } from '../../apps/web/src/app/api/runtime/outcomes/route';

function options(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'OPTIONS', headers } as any);
}

describe('runtime outcomes OPTIONS (CORS preflight)', () => {
  const url = 'http://localhost/api/runtime/outcomes';

  test('responds 204 with vary header', async () => {
    const res = await (OutcomesOptions as any)(options(url, { Origin: 'https://example.com' }));
    expect(res.status).toBe(204);
    expect(res.headers.get('vary')).toBe('Origin');
  });
});


