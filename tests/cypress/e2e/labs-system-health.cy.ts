describe('Labs System Health', () => {
  it('without auth shows ok and testRole=null', () => {
    cy.clearCookie('x-test-auth');
    cy.visit('/labs/system/health');
    cy.get('[data-testid="system-health-panel"]').should('be.visible');
    cy.get('[data-testid="status-ok"]').should('have.text', 'true');
    cy.get('[data-testid="status-test-role"]').should('have.text', 'null');
  });

  it('with teacher auth shows testRole=teacher', () => {
    cy.loginAs('teacher');
    cy.visit('/labs/system/health');
    cy.get('[data-testid="status-test-role"]').should('have.text', 'teacher');
  });
});


