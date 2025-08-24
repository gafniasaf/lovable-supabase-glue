import { describe, it, expect } from '@jest/globals';

describe('storageKey', () => {
  it('prefixes with tenant/product and includes entity/id/filename', async () => {
    const mod = await import('../../apps/web/src/lib/storageKey');
    const key = mod.storageKey({ tenantId: 't-1', product: 'expertfolio', entity: 'assessment', id: 'a-1', filename: 'file.pdf' });
    expect(key.startsWith('t-1/expertfolio/assessment/a-1/')).toBe(true);
    expect(key.endsWith('/file.pdf')).toBe(true);
  });
});


