describe('Logout flow', () => {
	it('clears role and shows anonymous after sign out', () => {
		cy.loginAs('teacher');
		cy.visit('/dashboard');
		cy.get('[data-testid="whoami-role"]').should('contain.text', 'teacher');
		cy.get('[data-testid="signout-btn"]').click();
		cy.get('[data-testid="whoami-role"]').should('contain.text', 'anonymous');
	});
});



