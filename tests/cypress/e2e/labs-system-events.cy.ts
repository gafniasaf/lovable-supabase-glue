describe('Labs System Events', () => {
	it('renders events list or empty state', () => {
		cy.visit('/labs/system/events');
		cy.contains('Events (labs)').should('be.visible');
	});
});



