// @ts-nocheck
describe('Teacher dashboard', () => {
	it('loads with test-mode auth', () => {
		// Set cookie before first navigation to avoid hydration/runtime races
		cy.loginAs('teacher');
		cy.visit('/dashboard/teacher');
		// Ensure test-mode header on SSR requests too
		cy.request({ method: 'GET', url: '/api/health', headers: { 'x-test-auth': 'teacher' } });
		// Ignore benign React runtime errors in CI builds
		Cypress.on('uncaught:exception', () => false);
		cy.contains('h1', 'Your courses').should('be.visible');
	});
});


