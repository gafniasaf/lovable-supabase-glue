describe('Admin parent links UI', () => {
	it('admin can add and remove parent links', () => {
		cy.loginAs('admin');
		const parentId = 'parent-1234';
		cy.visit(`/dashboard/admin/parent-links?parent_id=${parentId}`);
		cy.get('[data-testid="add-link-form"]').should('be.visible');
		cy.get('[data-testid="student-id-input"]').type('student-5678');
		cy.get('[data-testid="add-link-btn"]').click();
		cy.get('[data-testid="links-list"]').should('be.visible');
		cy.get('[data-testid="link-row"]').should('have.length', 1);
		cy.get('[data-testid="link-student"]').first().should('have.text', 'student-5678');
		cy.get('[data-testid="remove-link-btn"]').first().click();
		cy.get('[data-testid="link-row"]').should('have.length.at.least', 0);
	});
});
