import { createRegistryGateway } from '../../apps/web/src/lib/data/registry';

describe('RegistryGateway filters (test mode)', () => {
  const orig = { ...process.env } as any;
  beforeEach(() => { process.env = { ...orig, TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = orig; });

  test('listCourses with filters returns rows', async () => {
    const gw = createRegistryGateway();
    const { rows } = await gw.listCourses({ q: 'Course', status: 'approved', kind: 'v2', page: 2, page_size: 5 });
    expect(Array.isArray(rows)).toBe(true);
  });
});


