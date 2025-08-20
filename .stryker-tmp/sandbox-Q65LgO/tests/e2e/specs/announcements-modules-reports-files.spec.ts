// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Announcements, Modules, Reports, Files', () => {
	test('teacher posts announcement, creates module; reports respond; test upload/download works', async ({ request }) => {
		await request.get('/api/test/seed?hard=1');

		// Create course
		const courseRes = await request.post('/api/courses', { headers: { 'x-test-auth': 'teacher' }, data: { title: 'Comms Course', description: '' } });
		expect(courseRes.ok()).toBeTruthy();
		const course = await courseRes.json();

		// Announcement
		const ann = await request.post('/api/announcements', { headers: { 'x-test-auth': 'teacher' }, data: { course_id: course.id, title: 'Welcome', body: 'Hello class' } });
		expect(ann.ok()).toBeTruthy();
		const listAnn = await request.get(`/api/announcements?course_id=${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
		expect(listAnn.ok()).toBeTruthy();

		// Module
		const mod = await request.post('/api/modules', { headers: { 'x-test-auth': 'teacher' }, data: { course_id: course.id, title: 'Module A', order_index: 1 } });
		expect(mod.ok()).toBeTruthy();
		const listMod = await request.get(`/api/modules?course_id=${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
		expect(listMod.ok()).toBeTruthy();

		// Reports
		const eng = await request.get(`/api/reports/engagement?course_id=${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
		expect(eng.ok()).toBeTruthy();
		const dist = await request.get(`/api/reports/grade-distribution?course_id=${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
		expect(dist.ok()).toBeTruthy();

		// Files: request upload url, then PUT bytes to test-mode endpoint, then GET download
		const up = await request.post('/api/files/upload-url', { headers: { 'x-test-auth': 'teacher' }, data: { owner_type: 'user', owner_id: 'test-teacher-id', content_type: 'text/plain', filename: 'hello.txt' } });
		expect(up.ok()).toBeTruthy();
		const urlInfo = await up.json();
		const put = await request.fetch(urlInfo.url, { method: 'PUT', headers: { 'x-test-auth': 'teacher', 'content-type': 'text/plain' }, data: 'hello world' });
		expect(put.ok()).toBeTruthy();
		const dl = await request.get(`/api/files/download-url?id=${encodeURIComponent((await put.json()).id)}`, { headers: { 'x-test-auth': 'teacher' } });
		expect(dl.ok()).toBeTruthy();
	});
});


