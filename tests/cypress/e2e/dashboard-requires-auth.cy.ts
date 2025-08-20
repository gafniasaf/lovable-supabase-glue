describe('Dashboard requires auth (skipped in test-mode)', () => {
  it('redirects to login when unauthenticated outside test-mode', () => {
    cy.request('/api/health').then((res) => {
      if (res.body && res.body.testRole) return; // skip in test-mode
      cy.visit('/dashboard');
      cy.url().should('match', /\/login/);
    });
  });
});


