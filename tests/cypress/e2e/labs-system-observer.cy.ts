describe('Labs System Observer', () => {
	it('shows computed percentiles and samples', () => {
		cy.visit('/labs/system/observer');
		cy.get('[data-testid="observer-sample-count"]').invoke('text').then((t) => {
			expect(Number(t)).to.be.greaterThan(0);
		});
		cy.get('[data-testid="observer-p50"]').should('exist');
		cy.get('[data-testid="observer-item"]').should('have.length.greaterThan', 0);
	});
});



