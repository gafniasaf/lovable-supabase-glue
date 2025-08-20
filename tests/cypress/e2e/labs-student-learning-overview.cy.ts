describe('Labs Student Learning Overview', () => {
  it('shows enrollments with lesson counts', () => {
    // Seed teacher course and lessons
    cy.loginAs('teacher');
    cy.request('POST', '/api/courses', { title: `Course ${Date.now()}`, description: 'D' }).then((createCourse) => {
      expect(createCourse.status).to.eq(201);
      const course = createCourse.body;
      const createLesson = (i: number) =>
        cy.request('POST', '/api/lessons', { course_id: course.id, title: `L${i} title`, content: 'Body', order_index: i });
      createLesson(1);
      createLesson(2);
      createLesson(3);

      // Student enrolls
      cy.loginAs('student');
      cy.request('POST', '/api/enrollments', { course_id: course.id }).its('status').should('eq', 201);

      // Visit overview
      cy.visit('/labs/student/learning-overview');
      cy.get('[data-testid="learning-grid"]').should('be.visible');
      cy.get('[data-testid="learning-course-id"]').first().should('have.text', course.id);
      cy.get('[data-testid="learning-lesson-count"]').first().should('have.text', '3');
    });
  });
});


