// @ts-nocheck
describe('Labs System Auth Check', () => {
  it('without cookie shows sign-in prompt and link', () => {
    cy.clearCookie('x-test-auth');
    cy.visit('/labs/system/auth-check');
    cy.contains('You are not signed in').should('be.visible');
    cy.contains('a', 'Sign in').should('have.attr', 'href', '/login');
  });

  it('with student auth shows email and role', () => {
    cy.loginAs('student');
    cy.visit('/labs/system/auth-check');
    cy.get('[data-testid="auth-role"]').should('have.text', 'student');
    cy.get('[data-testid="auth-email"]').invoke('text').should('match', /@/);
  });
});


