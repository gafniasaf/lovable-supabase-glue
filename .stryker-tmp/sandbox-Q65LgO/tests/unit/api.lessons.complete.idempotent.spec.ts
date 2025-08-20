// @ts-nocheck
import { POST as CompletePOST } from '../../apps/web/src/app/api/lessons/complete/route';

function post(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/lessons/complete', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('lessons complete idempotence (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('double-complete returns 200 both times with consistent latest', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const id = '00000000-0000-0000-0000-00000000aa11';
    const r1 = await (CompletePOST as any)(post({ lessonId: id }));
    const j1 = await r1.json();
    const r2 = await (CompletePOST as any)(post({ lessonId: id }));
    const j2 = await r2.json();
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(j1.latest.lessonId).toBe(id);
    expect(j2.latest.lessonId).toBe(id);
  });
});


