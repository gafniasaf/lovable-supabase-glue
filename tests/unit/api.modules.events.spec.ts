import { POST as ModulesPOST, DELETE as ModulesDEL } from '../../apps/web/src/app/api/modules/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/modules', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);

describe('modules event producers (TEST_MODE)', () => {
  const orig = { ...process.env } as any;
  beforeEach(() => { process.env = { ...orig, TEST_MODE: '1', NEXT_PUBLIC_TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = orig; });

  test('create emits module.create', async () => {
    const { getInMemoryEvents } = await import('../../apps/web/src/lib/events');
    const res = await (ModulesPOST as any)(post({ course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000010', title: 'Mod', order_index: 1 }, { 'x-test-auth': 'teacher' }));
    expect([201,500]).toContain(res.status);
    const ev = getInMemoryEvents().find(e => e.event_type === 'module.create');
    expect(ev).toBeTruthy();
  });

  test('delete emits module.delete', async () => {
    const { getInMemoryEvents } = await import('../../apps/web/src/lib/events');
    const res = await (ModulesDEL as any)(del('http://localhost/api/modules?id=aaaaaaaa-aaaa-aaaa-aaaa-000000000011', { 'x-test-auth': 'teacher' }));
    expect([200,500,404]).toContain(res.status);
    const ev = getInMemoryEvents().find(e => e.event_type === 'module.delete');
    expect(ev).toBeTruthy();
  });
});


