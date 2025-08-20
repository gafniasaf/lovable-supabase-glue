// @ts-nocheck
describe('Student dashboard', () => {
	it('shows enrolled course', () => {
		// Seed: teacher creates course
		cy.loginAs('teacher');
		cy.request({ method: 'POST', url: '/api/courses', body: { title: 'T1', description: '' }, headers: { 'x-test-auth': 'teacher' } })
			.its('body').then((course: any) => {
				// Enroll as student
				cy.loginAs('student');
				cy.request({ method: 'POST', url: '/api/enrollments', body: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
				// View dashboard
				cy.visit('/dashboard/student');
				cy.get('[data-testid="student-courses-grid"]').should('be.visible');
				cy.get('[data-testid="student-course-card"]').should('be.visible');
			});
	});
});


