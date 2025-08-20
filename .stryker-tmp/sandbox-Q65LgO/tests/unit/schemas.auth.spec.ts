// @ts-nocheck
import { loginRequest, profileResponse, userRole } from '@shared/schemas/auth';

test('loginRequest validates email and password', () => {
  expect(() => loginRequest.parse({ email: 'a@b.com', password: 'password1' })).not.toThrow();
  expect(() => loginRequest.parse({ email: 'bad', password: 'password1' })).toThrow();
  expect(() => loginRequest.parse({ email: 'a@b.com', password: 'short' })).toThrow();
});

test('profileResponse schema', () => {
  expect(() => profileResponse.parse({ id: 'u1', email: 't@example.com', role: 'teacher' })).not.toThrow();
  expect(() => profileResponse.parse({ id: 'u1', email: 'bad', role: 'teacher' })).toThrow();
  expect(() => userRole.parse('student')).not.toThrow();
  expect(() => userRole.parse('unknown')).toThrow();
});


