// @ts-nocheck
describe('Labs System Uptime Tile', () => {
  it('renders ok and timestamps without auth', () => {
    cy.clearCookie('x-test-auth');
    cy.visit('/labs/system/uptime-tile');
    cy.get('[data-testid="uptime-ok"]').should('have.text', 'true');
    cy.get('[data-testid="uptime-ts-iso"]').invoke('text').should('contain', 'T');
    cy.get('[data-testid="uptime-ts-human"]').invoke('text').should('contain', 'ago');
    cy.get('[data-testid="uptime-test-role"]').should('have.text', 'null');
  });

  it('shows teacher role when cookie set', () => {
    cy.loginAs('teacher');
    cy.visit('/labs/system/uptime-tile');
    cy.get('[data-testid="uptime-test-role"]').should('have.text', 'teacher');
  });
});


