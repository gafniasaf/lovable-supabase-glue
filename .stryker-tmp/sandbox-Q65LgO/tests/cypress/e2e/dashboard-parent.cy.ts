// @ts-nocheck
describe('Parent dashboard', () => {
	it('lists linked student', () => {
		// Admin links parent to student via API
		cy.loginAs('admin');
		cy.request({ method: 'POST', url: '/api/parent-links', body: { parent_id: 'test-parent-id', student_id: 'test-student-id' }, headers: { 'x-test-auth': 'admin' } })
			.its('status').should('be.oneOf', [200,201]);
		// Visit parent dashboard as parent
		cy.loginAs('parent');
		cy.visit('/dashboard/parent');
		cy.get('[data-testid="parent-children-list"]').should('be.visible');
		cy.get('[data-testid="parent-child-row"]').first().should('be.visible');
	});
});


