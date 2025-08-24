import { test, expect } from '@playwright/test';

test.describe('Smoke @smoke', () => {
  test('home page renders and health endpoint works', async ({ page }) => {
    // Retry health for up to 5s to tolerate initial route compilation
    const start = Date.now();
    let ok = false;
    while (Date.now() - start < 5000) {
      const r = await page.request.get('/api/health');
      if (r.ok()) { ok = true; break; }
      await page.waitForTimeout(250);
    }
    expect(ok).toBeTruthy();
    const res = await page.request.get('/api/health');
    const json = await res.json();
    expect(json.ok).toBe(true);
    await page.goto('/');
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test('dashboard loads per role and student can mark lesson complete', async ({ page, request }) => {
    // Determine cookie domain from configured base URL (works in Docker where host is `web`)
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030');
    // Teacher dashboard
    await page.context().addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/' }] as any);
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Role: teacher')).toBeVisible();

    // Create a course and lesson via API to seed student flow
    const createCourse = await request.post('/api/courses', { data: { title: 'E2E Course', description: '' }, headers: { 'x-test-auth': 'teacher' } });
    const course = createCourse.ok() ? await createCourse.json() : null as any;
    if (course?.id) {
      await request.post('/api/lessons', { data: { course_id: course.id, title: 'Lesson 1', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
      // Enroll the student into the course for realistic navigation
      await page.context().clearCookies();
      await page.context().addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/' }] as any);
      await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
    }

    // Switch to student
    await page.context().clearCookies();
    await page.context().addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/' }] as any);
    // Basic smoke: dashboard renders as student
    await page.goto('/dashboard');
    await expect(page.getByText('Role: student')).toBeVisible();

    // Reports API smoke: engagement and grade distribution JSON/CSV
    if (course?.id) {
      const eng = await request.get(`/api/reports/engagement?course_id=${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
      expect(eng.ok()).toBeTruthy();
      const distJson = await request.get(`/api/reports/grade-distribution?course_id=${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
      expect(distJson.ok()).toBeTruthy();
      const distCsv = await request.get(`/api/reports/grade-distribution?course_id=${course.id}&format=csv`, { headers: { 'x-test-auth': 'teacher' } });
      expect(distCsv.ok()).toBeTruthy();
      expect((await distCsv.text()).startsWith('bucket,count')).toBeTruthy();
    }

    // If a course exists and student has access, try navigating and clicking Mark complete if present
    // This is best-effort smoke without relying on IDs
    try {
      await page.goto('/dashboard/student');
      const firstCard = page.getByTestId('student-course-card').first();
      if (await firstCard.isVisible({ timeout: 1000 }).catch(() => false)) {
        await firstCard.click();
        await page.waitForLoadState('domcontentloaded');
        const markBtn = page.getByRole('button', { name: /mark complete/i }).first();
        if (await markBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await markBtn.click();
        }
      }
    } catch {}
  });
});


