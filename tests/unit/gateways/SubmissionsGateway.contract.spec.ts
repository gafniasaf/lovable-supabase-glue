import { z } from 'zod';
function mockFetchOnce(fn: (input: RequestInfo, init?: RequestInit) => Promise<any>) {
  const original = global.fetch as any;
  const ResponseCtor = (global as any).Response || class {
    body: any; status: number; headers: any; ok: boolean; constructor(body: any, init: any) { this.body = body; this.status = init?.status || 200; this.headers = new Map(Object.entries(init?.headers || {})); this.ok = this.status >= 200 && this.status < 300; }
    async json() { try { return JSON.parse(this.body); } catch { return this.body; } }
    async text() { return String(this.body); }
  } as any;
  (global as any).Response = ResponseCtor;
  (global as any).fetch = jest.fn(fn);
  return () => { (global as any).fetch = original; };
}
import { createSubmissionsGateway } from '@/lib/data/submissions';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

describe('SubmissionsGateway contract', () => {
  test('create validates response shape', async () => {
    const restore = mockFetchOnce(async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/submissions') && (init?.method || 'GET') === 'POST') {
        return new (global as any).Response(JSON.stringify({ id: '00000000-0000-0000-0000-000000000001', student_id: '00000000-0000-0000-0000-000000000002', assignment_id: '00000000-0000-0000-0000-000000000003', submitted_at: new Date().toISOString(), score: null }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new (global as any).Response('null', { status: 200, headers: { 'content-type': 'application/json' } });
    });
    const res = await createSubmissionsGateway().create({ assignment_id: '00000000-0000-0000-0000-000000000003', text: '' } as any);
    expect(res.id).toMatch(/0000/);
    restore();
  });

  test('invalid response shape throws', async () => {
    const restore = mockFetchOnce(async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/submissions') && (init?.method || 'GET') === 'POST') {
        return new (global as any).Response(JSON.stringify({ wrong: true }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new (global as any).Response('null', { status: 200, headers: { 'content-type': 'application/json' } });
    });
    await expect(createSubmissionsGateway().create({ assignment_id: '00000000-0000-0000-0000-000000000003' } as any)).rejects.toThrow();
    restore();
  });
});


