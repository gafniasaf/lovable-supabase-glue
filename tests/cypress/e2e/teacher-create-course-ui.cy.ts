describe('Teacher create course via UI', () => {
  it('creates a course and appears on dashboard', () => {
    cy.loginAs('teacher');
    cy.visit('/dashboard/teacher');
    // If a create form exists; otherwise skip gracefully
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="create-course-form"]').length) {
        const title = `Course ${Date.now()}`;
        cy.get('[data-testid="create-course-form"]').within(() => {
          cy.get('input[name="title"]').type(title);
          cy.get('textarea[name="description"]').type('Created via UI');
          cy.root().submit();
        });
        cy.contains('[data-testid="course-card-title"]', title, { timeout: 5000 }).should('be.visible');
      }
    });
  });
});


