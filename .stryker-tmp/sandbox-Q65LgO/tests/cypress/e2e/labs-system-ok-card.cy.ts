// @ts-nocheck
describe('Labs System OK Card', () => {
  it('shows ok=true and humanized ts', () => {
    cy.visit('/labs/system/ok-card');
    cy.get('[data-testid="ok-value"]').should('have.text', 'true');
    cy.get('[data-testid="ts-human"]').invoke('text').should('match', /ago/);
  });
});


