describe('Session UX', () => {
  it('whoami header visible and sign-out link present', () => {
    cy.loginAs('teacher');
    cy.visit('/dashboard');
    cy.get('[data-testid="whoami-role"]').should('be.visible');
    cy.get('[data-testid="signout-btn"]').should('be.visible');
  });
});


