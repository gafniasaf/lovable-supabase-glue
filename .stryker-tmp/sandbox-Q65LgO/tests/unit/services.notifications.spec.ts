// @ts-nocheck
import { resetTestStore, addTestNotification, shouldDeliverTestNotification, setTestFeatureFlag, getTestNotificationPreferences, setTestNotificationPreferences } from '../../apps/web/src/lib/testStore';

describe('services.notifications (test-store producers/prefs)', () => {
  beforeEach(() => { resetTestStore(); });

  test('producers called on submission graded; preferences gating simulated', () => {
    const uid = 'u1';
    // default: on
    expect(shouldDeliverTestNotification(uid, 'submission:graded')).toBe(true);
    const n = addTestNotification({ user_id: uid, type: 'submission:graded', payload: { score: 90 } });
    expect(n.type).toBe('submission:graded');
    // turn off
    setTestNotificationPreferences(uid, { 'submission:graded': false } as any);
    expect(shouldDeliverTestNotification(uid, 'submission:graded')).toBe(false);
  });
});


