import { userRole } from '@shared/schemas/auth';

test('validates role', () => {
  expect(() => userRole.parse('teacher')).not.toThrow();
});


