// @ts-nocheck
describe('Labs Parent Children', () => {
  it('parent children list and detail', () => {
    // Seed as admin
    cy.loginAs('admin');
    cy.request('POST', '/api/parent-links', { parent_id: 'test-parent-id', student_id: 'test-student-id' }).its('status').should('eq', 201);

    // Switch to parent
    cy.loginAs('parent');
    cy.visit('/labs/parent/children');
    cy.get('[data-testid="children-list"]').should('be.visible');
    cy.get('[data-testid="child-student-id"]').first().should('have.text', 'test-student-id');
    cy.get('[data-testid="child-student-id"]').first().click({ force: true });
    cy.get('[data-testid="child-detail"]').should('be.visible');
    cy.get('[data-testid="child-detail-student-id"]').should('have.text', 'test-student-id');
  });
});


