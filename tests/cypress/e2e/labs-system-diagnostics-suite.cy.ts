describe('Labs System Diagnostics Suite', () => {
	it('renders batch and overall stats', () => {
		cy.visit('/labs/system/diagnostics-suite');
		cy.get('[data-testid="diag-batch-card-10"]').should('be.visible');
		cy.get('[data-testid="diag-batch-sample-count-10"]').invoke('text').then((t) => {
			expect(Number(t)).to.be.greaterThan(0);
		});
		cy.get('[data-testid="diag-overall-sample-count"]').invoke('text').then((t) => {
			expect(Number(t)).to.be.greaterThan(0);
		});
	});
});



