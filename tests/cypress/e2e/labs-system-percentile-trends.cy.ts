describe('Labs System Percentile Trends', () => {
	it('renders windows and items', () => {
		cy.visit('/labs/system/percentile-trends');
		cy.get('[data-testid="trends-window-count"]').invoke('text').then((t) => {
			expect(Number(t)).to.be.greaterThan(0);
		});
		cy.get('[data-testid="trends-window-row"]').should('have.length.greaterThan', 0);
		cy.get('[data-testid="trends-item"]').should('have.length.greaterThan', 0);
	});
});



