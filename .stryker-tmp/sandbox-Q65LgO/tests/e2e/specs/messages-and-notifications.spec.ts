// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) resp = await request.post('/api/__test__/reset');
  expect(resp.ok()).toBeTruthy();
});

test('create thread, send message, list messages, list notifications (test-mode)', async ({ request, context, page }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

  // Create a thread with one other participant (student)
  let resp = await request.post('/api/messages/threads', { data: { participant_ids: ['test-student-id'] }, headers: { 'x-test-auth': 'teacher' } });
  expect(resp.status()).toBe(201);
  const thread = await resp.json();

  // Send a message
  resp = await request.post('/api/messages', { data: { thread_id: thread.id, body: 'Hello there' }, headers: { 'x-test-auth': 'teacher' } });
  expect(resp.status()).toBe(201);
  const msg = await resp.json();
  expect(msg.body).toBe('Hello there');

  // List messages
  resp = await request.get(`/api/messages?thread_id=${thread.id}`, { headers: { 'x-test-auth': 'teacher' } });
  expect(resp.ok()).toBeTruthy();
  const messages = await resp.json();
  expect(Array.isArray(messages)).toBe(true);
  expect(messages.length).toBeGreaterThanOrEqual(1);

  // List notifications for current user
  resp = await request.get('/api/notifications', { headers: { 'x-test-auth': 'teacher' } });
  expect(resp.ok()).toBeTruthy();
  const notes = await resp.json();
  expect(Array.isArray(notes)).toBe(true);
});


