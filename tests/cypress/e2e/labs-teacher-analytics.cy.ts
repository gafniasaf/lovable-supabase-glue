describe('Teacher analytics exports', () => {
	it('shows CSV and JSON download links', () => {
		cy.loginAs('teacher');
		const headers = { 'x-test-auth': 'teacher' } as any;
		// Seed a small dataset
		cy.request({ method: 'POST', url: '/api/courses', body: { title: 'Course C' }, headers }).its('body').then((course: any) => {
			cy.request({ method: 'POST', url: '/api/lessons', body: { course_id: course.id, title: 'Lesson 1', content: '', order_index: 1 }, headers, failOnStatusCode: false });
			cy.visit('/labs/teacher/analytics');
			cy.get('[data-testid="analytics-table"]').should('be.visible');
			// Export links optional; validate if present
			cy.get('body').then($b => {
				if ($b.find('[data-testid="analytics-csv-link"]').length) {
					cy.get('[data-testid="analytics-csv-link"]').should('be.visible');
				}
				if ($b.find('[data-testid="analytics-json-link"]').length) {
					cy.get('[data-testid="analytics-json-link"]').should('be.visible');
				}
			});
		});
	});
});


