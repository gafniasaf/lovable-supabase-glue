describe('Teacher announcements CRUD', () => {
	beforeEach(() => {
		cy.request('POST', '/api/test/reset');
	});

	it('create and delete announcement for a course', () => {
		cy.loginAs('teacher');
		cy.request('POST', '/api/courses', { title: 'Course Ann' }).its('body').then((course: any) => {
			cy.visit(`/dashboard/teacher/${course.id}/announcements`);
			cy.get('[data-testid="ann-input-title"]').type('Welcome');
			cy.get('[data-testid="ann-input-body"]').type('Hello world');
			cy.get('[data-testid="ann-save"]').click();
			cy.get('[data-testid="ann-list"]').should('be.visible');
			cy.contains('[data-testid="ann-row"]', 'Welcome').as('row');
			cy.get('@row').find('[data-testid="ann-delete-btn"]').click({ force: true });
		});
	});
});



