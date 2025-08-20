describe('Labs Student Enrollments Grid', () => {
  it('shows enrolled course id', () => {
    // Seed: teacher creates a course
    cy.loginAs('teacher');
    cy.request('POST', '/api/courses', { title: `Course ${Date.now()}`, description: 'D' }).then((createCourse) => {
      expect(createCourse.status).to.eq(201);
      const course = createCourse.body;

      // Student enrolls
      cy.loginAs('student');
      cy.request('POST', '/api/enrollments', { course_id: course.id }).its('status').should('eq', 201);

      // Visit grid
      cy.visit('/labs/student/enrollments-grid');
      cy.get('[data-testid="enrollments-grid"]').should('be.visible');
      cy.get('[data-testid="enrollment-course-id"]').first().should('have.text', course.id);
    });
  });
});


