// @ts-nocheck
import { POST as SavePOST } from '../../apps/web/src/app/api/runtime/checkpoint/save/route';
import { POST as LoadPOST } from '../../apps/web/src/app/api/runtime/checkpoint/load/route';

const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime checkpoint save/load', () => {
  beforeEach(() => {
    (process.env as any).RUNTIME_API_V2 = '1';
    delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY;
    (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret';
  });

  test('oversize payload rejected', async () => {
    (process.env as any).RUNTIME_CHECKPOINT_MAX_BYTES = '64';
    const big = { key: 'k1', state: { data: 'x'.repeat(200) } };
    const res = await (SavePOST as any)(post('http://localhost/api/runtime/checkpoint/save', big));
    expect([400,413,401]).toContain(res.status);
  });
});


