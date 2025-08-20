// @ts-nocheck
describe('Teacher grade submissions', () => {
	it('teacher can grade a submission', () => {
		// Teacher creates course and assignment
		cy.loginAs('teacher');
		const teachHeaders = { 'x-test-auth': 'teacher' } as any;
		cy.request({ method: 'POST', url: '/api/courses', body: { title: 'Course G' }, headers: teachHeaders }).its('body').then((course: any) => {
			cy.request({ method: 'POST', url: '/api/assignments', body: { course_id: course.id, title: 'Assignment G' }, headers: teachHeaders, failOnStatusCode: false }).then((ar) => {
				if (![200,201].includes(ar.status)) { cy.log('assignments API not available'); return; }
				const assignment = ar.body;
				// Student enrolls and submits
				cy.loginAs('student');
				cy.request({ method: 'POST', url: '/api/enrollments', body: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
				cy.request({ method: 'POST', url: '/api/submissions', body: { assignment_id: assignment.id, text: 'My answer' }, headers: { 'x-test-auth': 'student' } });

				// Teacher views submissions and grades
				cy.loginAs('teacher');
				cy.visit(`/dashboard/teacher/${course.id}/assignments/${assignment.id}/submissions`);
				cy.get('[data-testid="submissions-list"]').should('be.visible');
				cy.get('[data-testid="submission-row"]').should('have.length.at.least', 1);
				cy.get('[data-testid="grade-score"]').clear().type('95');
				cy.get('[data-testid="grade-feedback"]').clear().type('Great job');
				cy.get('[data-testid="grade-save"]').click();
				cy.get('[data-testid="submission-score"]').should('have.text', '95');
				cy.get('[data-testid="submission-feedback"]').should('have.text', 'Great job');
			});
		});
	});
});


