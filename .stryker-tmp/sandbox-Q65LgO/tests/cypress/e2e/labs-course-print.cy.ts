// @ts-nocheck
describe('Labs Course Print', () => {
  it('print view lists lessons in order with preview (SSR)', () => {
    cy.loginAs('teacher');
    const courseTitle = `Course ${Date.now()}`;
    cy.request('POST', '/api/courses', { title: courseTitle, description: 'For print view test' }).then((createCourse) => {
      expect(createCourse.status).to.eq(201);
      const course = createCourse.body;

      const createLesson = (title: string, order: number) =>
        cy.request('POST', '/api/lessons', { course_id: course.id, title, content: 'Body', order_index: order }).its('status').should('eq', 201);
      createLesson('Intro', 1);
      createLesson('Chapter 1', 2);

      cy.visit(`/labs/teacher/${course.id}/print`);
      cy.get('[data-testid="lesson-row"]').first().as('firstRow');
      cy.get('@firstRow').should('be.visible');
      cy.get('@firstRow').find('[data-testid="lesson-order"]').should('have.text', '#1');
      cy.get('@firstRow').find('[data-testid="lesson-title"]').should('have.text', 'Intro');
    });
  });
});


