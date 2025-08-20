describe('Teacher course authoring flow', () => {
	it('create course, add lesson via API, enroll student, mark complete', () => {
		cy.request('/api/test/seed?hard=1');
		cy.request({ method: 'POST', url: '/api/courses', headers: { 'x-test-auth': 'teacher' }, body: { title: 'E2E Created Course', description: 'e2e' } })
			.its('body').then((course: any) => {
				cy.request({ method: 'POST', url: '/api/lessons', headers: { 'x-test-auth': 'teacher' }, body: { course_id: course.id, title: 'E2E Lesson 1', content: 'body', order_index: 1 } })
					.its('body').then((lesson: any) => {
						cy.request({ method: 'POST', url: '/api/enrollments', headers: { 'x-test-auth': 'student' }, body: { course_id: course.id } });
						cy.request({ method: 'POST', url: '/api/lessons/complete', headers: { 'x-test-auth': 'student' }, body: { lessonId: lesson.id } })
							.its('status').should('be.oneOf', [200, 201]);
						cy.loginAs('teacher');
						cy.visit(`/dashboard/teacher/${course.id}`);
						cy.contains('h1, h2, [data-testid="course-title"]', 'E2E Created Course').should('be.visible');
					});
			});
	});
});



