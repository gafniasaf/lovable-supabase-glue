// @ts-nocheck
describe('Labs System Request ID', () => {
  it('request id is present on labs page', () => {
    cy.visit('/labs/system/request-id');
    cy.get('[data-testid="request-id"]').should('be.visible');
    cy.get('[data-testid="request-id-present"]').should('have.text', 'true');
  });
});


