import { test, expect } from '@playwright/test';

test.describe('Teacher announcements CRUD', () => {
  test.beforeEach(async ({ request }) => {
    const resp = await request.post('/api/test/reset');
    expect(resp.ok()).toBeTruthy();
  });

  test('create and delete announcement for a course', async ({ request, context, page, baseURL }) => {
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
    await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const headers = { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any;

    // Seed a course
    const courseRes = await request.post('/api/courses', { data: { title: 'Course Ann' }, headers });
    expect(courseRes.ok()).toBeTruthy();
    const course = await courseRes.json();

    // Go to course announcements page (ensure test-mode header via cookie)
    await page.goto(`/dashboard/teacher/${course.id}`);
    // Navigate via link to favor SSR header propagation
    await page.goto(`/dashboard/teacher/${course.id}/announcements`);
    await page.waitForTimeout(300);

    // Create
    await page.getByTestId('ann-input-title').click();
    await page.getByTestId('ann-input-title').fill('Welcome');
    await page.getByTestId('ann-input-body').fill('Hello world');
    await page.getByTestId('ann-save').click();
    await expect(page.getByTestId('ann-list')).toBeVisible();
    const row = page.getByTestId('ann-row').filter({ hasText: 'Welcome' });
    await expect(row.getByTestId('ann-body')).toHaveText('Hello world');

    // Delete
    await row.getByTestId('ann-delete-btn').click();
    await page.waitForTimeout(150);
  });

  test('scheduled publish_at in future is hidden from student until time', async ({ page, request, context, baseURL }) => {
    test.skip(!baseURL, 'Needs baseURL');
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
    await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const headers = { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any;

    const cRes = await request.post('/api/courses', { data: { title: `Ann Sched ${Date.now()}` }, headers });
    expect(cRes.ok()).toBeTruthy();
    const course = await cRes.json();

    const futureIso = new Date(Date.now() + 60_000).toISOString();
    const aRes = await request.post('/api/announcements', { data: { course_id: course.id, title: 'Hidden Soon', body: 'Wait for it', publish_at: futureIso }, headers });
    expect(aRes.ok()).toBeTruthy();

    // Student should not see it yet
    await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    await page.goto(`/labs/parent/announcements?course_id=${course.id}`);
    await page.waitForTimeout(200);
    const list = page.getByTestId('parent-ann-list');
    await expect(list).toHaveCount(0);

    // Teacher can see via include_unpublished flag (API)
    const tList = await request.get(`/api/announcements?course_id=${course.id}&include_unpublished=1`, { headers: { 'x-test-auth': 'teacher' } });
    expect(tList.ok()).toBeTruthy();
    const rows = await tList.json();
    expect(rows.length).toBeGreaterThan(0);
  });
});


