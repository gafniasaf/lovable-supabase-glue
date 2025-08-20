// @ts-nocheck
describe('Labs - Student Profile', () => {
  it('unauthenticated user sees sign-in prompt', () => {
    cy.clearCookie('x-test-auth');
    cy.visit('/labs/student/profile');
    cy.get('[data-testid="signin-prompt"]').should('be.visible');
    cy.get('[data-testid="signin-link"]').should('be.visible');
  });

  it('student can see profile email and role', () => {
    cy.loginAs('student');
    cy.visit('/labs/student/profile');
    cy.get('[data-testid="profile-role"]').should('have.text', 'student');
    cy.get('[data-testid="profile-email"]').invoke('text').should('match', /@/);
  });
});


