// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Student submit assignment', () => {
  test.beforeEach(async ({ request }) => {
    const resp = await request.post('/api/test/reset');
    expect(resp.ok()).toBeTruthy();
  });

  test('student can submit text answer', async ({ request, context, page, baseURL }) => {
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));

    // Teacher creates course and assignment
    await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const teachHeaders = { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any;
    let resp = await request.post('/api/courses', { data: { title: 'Course S' }, headers: teachHeaders });
    expect(resp.ok()).toBeTruthy();
    const course = await resp.json();
    resp = await request.post('/api/assignments', { data: { course_id: course.id, title: 'Assignment A' }, headers: teachHeaders });
    expect(resp.ok()).toBeTruthy();
    const assignment = await resp.json();

    // Student enrolls and submits
    await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const studHeaders = { 'content-type': 'application/json', 'x-test-auth': 'student' } as any;
    resp = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: studHeaders });
    expect(resp.ok()).toBeTruthy();

    await page.goto(`/dashboard/student/${course.id}/assignments/${assignment.id}/submit`);
    await expect(page.getByTestId('assignment-title')).toHaveText('Assignment A');
    await page.getByTestId('submit-text').fill('My answer');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('submit-ok')).toBeVisible();
  });
});


