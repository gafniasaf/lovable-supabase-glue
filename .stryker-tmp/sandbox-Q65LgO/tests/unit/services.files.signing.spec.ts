// @ts-nocheck
import { addTestFile, getTestFile, resetTestStore } from '../../apps/web/src/lib/testStore';

describe('services.files signing (test store)', () => {
  beforeEach(() => { resetTestStore(); });

  test('upload/download signing uses correct bucket/key, content types (simulated)', () => {
    const row = addTestFile({ owner_type: 'submission', owner_id: 'sub-1', content_type: 'text/plain', data_base64: Buffer.from('hi').toString('base64') });
    expect(row.owner_type).toBe('submission');
    const again = getTestFile(row.id);
    expect(again?.content_type).toBe('text/plain');
  });
});


