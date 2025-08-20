// @ts-nocheck
import { describe, it, expect, beforeEach } from '@jest/globals';
import { updateModuleApi } from '../../apps/web/src/server/services/modules';
import { addTestModule, resetTestStore } from '../../apps/web/src/lib/testStore';

describe('modules test-mode update', () => {
  beforeEach(() => {
    resetTestStore();
    //  set test mode
    process.env.TEST_MODE = '1';
  });

  it('returns the updated row with new title and order_index', async () => {
    const moduleRow = { id: 'cccccccc-cccc-cccc-cccc-123456789abc', course_id: 'cccccccc-cccc-cccc-cccc-aaaaaaaaaaaa', title: 'Old', order_index: 2, created_at: new Date().toISOString() } as any;
    addTestModule(moduleRow);
    const updated = await updateModuleApi(moduleRow.id, { title: 'New', order_index: 1 });
    expect(updated).toBeTruthy();
    expect(updated!.title).toBe('New');
    expect(updated!.order_index).toBe(1);
  });
});


