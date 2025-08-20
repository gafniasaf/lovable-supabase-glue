// @ts-nocheck
describe('Labs System Latency Histogram', () => {
  it('shows 100 samples and bins sum to 100', () => {
    cy.visit('/labs/system/latency-histogram');
    cy.get('[data-testid="hist-sample-count"]').should('have.text', '100');
    cy.get('[data-testid="hist-bin-0-49"]').invoke('text').then((t1) => {
      const n1 = parseInt(t1 || '0', 10);
      cy.get('[data-testid="hist-bin-50-99"]').invoke('text').then((t2) => {
        const n2 = parseInt(t2 || '0', 10);
        cy.get('[data-testid="hist-bin-100-199"]').invoke('text').then((t3) => {
          const n3 = parseInt(t3 || '0', 10);
          cy.get('[data-testid="hist-bin-200-499"]').invoke('text').then((t4) => {
            const n4 = parseInt(t4 || '0', 10);
            cy.get('[data-testid="hist-bin-500plus"]').invoke('text').then((t5) => {
              const n5 = parseInt(t5 || '0', 10);
              const sum = n1 + n2 + n3 + n4 + n5;
              expect(sum).to.eq(100);
              cy.get('[data-testid="hist-bin-total"]').should('have.text', '100');
            });
          });
        });
      });
    });
  });
});


