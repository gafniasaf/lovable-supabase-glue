// @ts-nocheck
describe('Labs System Role Badge', () => {
  it('reflects testRole from health endpoint', () => {
    cy.clearCookie('x-test-auth');
    cy.visit('/labs/system/role-badge');
    cy.get('[data-testid="role-value"]').should('have.text', 'null');

    cy.loginAs('teacher');
    cy.visit('/labs/system/role-badge');
    cy.get('[data-testid="role-value"]').should('have.text', 'teacher');
    cy.get('[data-testid="test-mode-value"]').should('have.text', 'true');
  });
});


