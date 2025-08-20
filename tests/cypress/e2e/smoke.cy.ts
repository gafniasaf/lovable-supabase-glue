describe('Smoke', () => {
	it('home page loads and health is ok', () => {
		cy.visit('/');
		cy.request('/api/health').its('status').should('eq', 200);
	});
});


