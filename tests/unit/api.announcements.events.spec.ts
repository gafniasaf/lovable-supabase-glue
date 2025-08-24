import { POST as AnnPOST, DELETE as AnnDEL } from '../../apps/web/src/app/api/announcements/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/announcements', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);

describe('announcements event producers (TEST_MODE)', () => {
  const orig = { ...process.env } as any;
  beforeEach(() => { process.env = { ...orig, TEST_MODE: '1', NEXT_PUBLIC_TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = orig; });

  test('create emits announcement.create', async () => {
    const { getInMemoryEvents } = await import('../../apps/web/src/lib/events');
    const res = await (AnnPOST as any)(post({ course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000001', title: 'T', body: 'B' }, { 'x-test-auth': 'teacher' }));
    expect([201,500]).toContain(res.status);
    const ev = getInMemoryEvents().find(e => e.event_type === 'announcement.create');
    expect(ev).toBeTruthy();
  });

  test('delete emits announcement.delete', async () => {
    const { getInMemoryEvents } = await import('../../apps/web/src/lib/events');
    const res = await (AnnDEL as any)(del('http://localhost/api/announcements?id=aaaaaaaa-aaaa-aaaa-aaaa-000000000002', { 'x-test-auth': 'teacher' }));
    expect([200,500,404]).toContain(res.status);
    const ev = getInMemoryEvents().find(e => e.event_type === 'announcement.delete');
    expect(ev).toBeTruthy();
  });
});


