describe('Modules SSR list', () => {
	it('renders in order for teacher', () => {
		cy.loginAs('teacher');
		const courseTitle = `Course ${Date.now()}`;
		cy.request({ method: 'POST', url: '/api/courses', body: { title: courseTitle, description: 'tmp' }, headers: { 'x-test-auth': 'teacher' } })
			.its('body').then((course: any) => {
				cy.request({ method: 'POST', url: '/api/modules', body: { course_id: course.id, title: 'Second', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } })
					.its('status').then((s) => { if (![200,201].includes(s)) cy.log('modules API not available'); });
				cy.request({ method: 'POST', url: '/api/modules', body: { course_id: course.id, title: 'First', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } })
					.its('status').then((s) => { if (![200,201].includes(s)) cy.log('modules API not available'); });
				cy.visit(`/dashboard/teacher/${course.id}/modules`);
				cy.get('[data-testid="modules-list"]').should('be.visible');
				cy.get('[data-testid="module-row"]').first().find('[data-testid="module-title"]').should('contain.text', '#1 - First');
				cy.get('[data-testid="module-row"]').eq(1).find('[data-testid="module-title"]').should('contain.text', '#2 - Second');
			});
	});
});


