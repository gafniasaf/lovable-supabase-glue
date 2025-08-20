import { updateUserRole } from '../../apps/web/src/server/services/users';

describe('users service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
  });

  test('updateUserRole stores role in test profile', async () => {
    const res = await updateUserRole({ userId: '00000000-0000-0000-0000-000000000001', role: 'teacher' });
    expect(res.role).toBe('teacher');
  });
});


