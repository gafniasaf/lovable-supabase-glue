// @ts-nocheck
describe('Admin update role (test-mode API)', () => {
  it('admin can update a user role', () => {
    cy.loginAs('admin');
    cy.request('PATCH', '/api/user/role', { userId: '00000000-0000-0000-0000-000000000001', role: 'teacher' })
      .its('status')
      .should('be.oneOf', [200, 204]);
  });
});


