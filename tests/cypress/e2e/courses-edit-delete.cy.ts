describe('Courses edit/delete', () => {
	it('teacher can edit and delete a course (test-mode)', () => {
		cy.request('POST', '/api/test/reset');
		cy.loginAs('teacher');
		const title = `Course ${Date.now()}`;
		cy.request({ method: 'POST', url: '/api/courses', body: { title, description: 'tmp' }, headers: { 'x-test-auth': 'teacher' } })
			.its('body').then((course: any) => {
				const newTitle = title + ' edited';
				cy.request({ method: 'PATCH', url: `/api/courses/${course.id}`, body: { title: newTitle }, headers: { 'x-test-auth': 'teacher' } })
					.its('status').should('be.oneOf', [200]);
				cy.request({ method: 'DELETE', url: `/api/courses/${course.id}`, headers: { 'x-test-auth': 'teacher' } })
					.its('status').should('be.oneOf', [200, 204]);
				cy.visit('/dashboard/teacher');
				cy.contains('h1', 'Your courses').should('be.visible');
			});
	});
});


