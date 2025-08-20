// @ts-nocheck
describe('Student submit assignment', () => {
	it('student can submit text answer', () => {
		cy.loginAs('teacher');
		const teachHeaders = { 'x-test-auth': 'teacher' } as any;
		cy.request({ method: 'POST', url: '/api/courses', body: { title: 'Course S' }, headers: teachHeaders }).its('body').then((course: any) => {
			cy.request({ method: 'POST', url: '/api/assignments', body: { course_id: course.id, title: 'Assignment A' }, headers: teachHeaders }).its('body').then((assignment: any) => {
				cy.loginAs('student');
				cy.request({ method: 'POST', url: '/api/enrollments', body: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
				cy.visit(`/dashboard/student/${course.id}/assignments/${assignment.id}/submit`);
				cy.get('[data-testid="assignment-title"]').should('have.text', 'Assignment A');
				cy.get('[data-testid="submit-text"]').type('My answer');
				cy.get('[data-testid="submit-btn"]').click();
				cy.get('[data-testid="submit-ok"]').should('be.visible');
			});
		});
	});
});


