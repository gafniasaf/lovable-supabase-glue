describe('Labs System Health History', () => {
  it('shows 10 samples and delta metrics', () => {
    cy.visit('/labs/system/health-history');
    cy.get('[data-testid="history-sample-count"]').should('have.text', '10');
    cy.get('[data-testid="history-min-delta"]').should('be.visible');
    cy.get('[data-testid="history-avg-delta"]').should('be.visible');
    cy.get('[data-testid="history-max-delta"]').should('be.visible');
    cy.get('[data-testid="history-item"]').first().should('be.visible');
  });
});


