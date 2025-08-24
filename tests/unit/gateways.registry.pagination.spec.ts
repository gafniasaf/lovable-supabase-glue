import { createRegistryGateway } from '../../apps/web/src/lib/data/registry';
import { z } from 'zod';
import { externalCourse } from '@education/shared';

describe('RegistryGateway listCourses (test mode)', () => {
  const orig = { ...process.env } as any;
  beforeEach(() => { process.env = { ...orig, TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = orig; });

  test('returns rows matching externalCourse schema and totalCount', async () => {
    const gw = createRegistryGateway();
    const { rows, totalCount } = await gw.listCourses({ page: 1, page_size: 10 });
    expect(Array.isArray(rows)).toBe(true);
    expect(typeof totalCount).toBe('number');
    z.array(externalCourse).parse(rows);
  });
});
