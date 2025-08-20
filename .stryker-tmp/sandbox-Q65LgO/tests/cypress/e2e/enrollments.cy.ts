// @ts-nocheck
describe('Enrollments', () => {
	it('student can enroll in a course and list it (test-mode)', () => {
		cy.loginAs('teacher');
		const title = `Course ${Date.now()}`;
		cy.request({ method: 'POST', url: '/api/courses', body: { title, description: 'E2E' }, headers: { 'x-test-auth': 'teacher' } })
			.its('body').then((course: any) => {
				cy.loginAs('student');
				cy.request({ method: 'POST', url: '/api/enrollments', body: { course_id: course.id }, headers: { 'x-test-auth': 'student' } })
					.its('status').should('be.oneOf', [200,201]);
				cy.request({ method: 'GET', url: '/api/enrollments', headers: { 'x-test-auth': 'student' } })
					.its('body').then((rows: any[]) => {
						expect(rows.map((r) => r.course_id)).to.include(course.id);
					});
			});
	});

	it('teacher cannot enroll', () => {
		cy.loginAs('teacher');
		cy.request({ method: 'POST', url: '/api/enrollments', body: { course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000000' }, headers: { 'x-test-auth': 'teacher' }, failOnStatusCode: false })
			.its('status').should('eq', 403);
	});
});


