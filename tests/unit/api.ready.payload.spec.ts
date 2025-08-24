import { GET as ReadyGET } from '../../apps/web/src/app/api/ready/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/ready payload and status', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('returns 200 when TEST_MODE=1', async () => {
    process.env = { ...orig, TEST_MODE: '1' } as any;
    const res = await (ReadyGET as any)(get('http://localhost/api/ready'));
    expect(res.status).toBe(200);
  });
});


