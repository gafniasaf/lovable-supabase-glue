describe('Labs System Throughput Profiler', () => {
	it('shows burst cards and allows chart download link', () => {
		cy.visit('/labs/system/throughput-profiler');
		cy.get('[data-testid="tp-overall-bursts"]').invoke('text').then((t) => {
			expect(Number(t)).to.be.greaterThan(0);
		});
		cy.get('[data-testid^="tp-burst-card-"]').should('have.length.greaterThan', 0);
		cy.get('[data-testid="tp-download-chart-json"]').should('have.attr', 'href');
	});
});



