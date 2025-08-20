import { notification, notificationMarkReadRequest } from '@shared';

describe('notification schemas', () => {
  test('notification valid', () => {
    expect(() => notification.parse({
      id: '00000000-0000-0000-0000-000000000001',
      user_id: 'u1',
      type: 'submission:graded',
      payload: { a: 1 },
      created_at: new Date().toISOString(),
      read_at: null
    })).not.toThrow();
  });

  test('notificationMarkReadRequest default true', () => {
    const v = notificationMarkReadRequest.parse({});
    expect(v.read).toBe(true);
  });
});


