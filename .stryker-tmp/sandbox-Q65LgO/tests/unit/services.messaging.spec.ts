// @ts-nocheck
import { resetTestStore, createTestThread, listTestParticipantsByThread, addTestMessage, listTestMessagesByThread, markTestMessageReadForUser, countUnreadForThread, markAllThreadMessagesReadForUser } from '../../apps/web/src/lib/testStore';

describe('services.messaging (test-store)', () => {
  beforeEach(() => { resetTestStore(); });

  test('thread create, participants list, send message, read receipts, unread counts', () => {
    const t = createTestThread(['u1', 'u2']);
    const parts = listTestParticipantsByThread(t.id);
    expect(parts.map((p: any) => p.user_id).sort()).toEqual(['u1', 'u2']);
    const m1 = addTestMessage({ thread_id: t.id, sender_id: 'u1', body: 'hello' });
    const m2 = addTestMessage({ thread_id: t.id, sender_id: 'u2', body: 'hi' });
    const msgs = listTestMessagesByThread(t.id);
    expect(msgs.map((m: any) => m.id)).toEqual([m1.id, m2.id]);
    // Unread counts for u1 (should not count own message)
    expect(countUnreadForThread(t.id, 'u1')).toBe(1);
    // Mark first as read for u1
    markTestMessageReadForUser(m2.id, 'u1');
    expect(countUnreadForThread(t.id, 'u1')).toBe(0);
    // Mark all for u2
    markAllThreadMessagesReadForUser(t.id, 'u2');
    expect(countUnreadForThread(t.id, 'u2')).toBe(0);
  });
});


