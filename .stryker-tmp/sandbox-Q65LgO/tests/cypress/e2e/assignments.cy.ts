// @ts-nocheck
describe('Assignments CRUD flow MVP', () => {
	it('teacher creates course and assignments; student submits; pages render', () => {
		cy.loginAs('teacher');
		const courseTitle = `Course ${Date.now()}`;
		cy.request({ method: 'POST', url: '/api/courses', body: { title: courseTitle, description: 'D' }, headers: { 'x-test-auth': 'teacher' } })
			.its('body').then((course: any) => {
				// Seed assignments
				cy.request({ method: 'POST', url: '/api/assignments', body: { course_id: course.id, title: 'Assn 1', description: 'Desc1' }, headers: { 'x-test-auth': 'teacher' } })
					.its('status').should('be.oneOf', [200, 201]);
				cy.request({ method: 'POST', url: '/api/assignments', body: { course_id: course.id, title: 'Assn 2', description: 'Desc2' }, headers: { 'x-test-auth': 'teacher' } })
					.its('status').should('be.oneOf', [200, 201]);

				// Teacher view: newest first
				cy.visit(`/dashboard/teacher/${course.id}/assignments`);
				cy.get('[data-testid="assignments-list"]').should('be.visible');
				cy.get('[data-testid="assignment-row"]').should('have.length', 2);
				cy.get('[data-testid="assignment-row"]').eq(0).find('[data-testid="assignment-title"]').should('have.text', 'Assn 2');
				cy.get('[data-testid="assignment-row"]').eq(1).find('[data-testid="assignment-title"]').should('have.text', 'Assn 1');

				// Student submits to first assignment
				cy.loginAs('student');
				cy.request({ method: 'GET', url: `/api/assignments?course_id=${course.id}`, headers: { 'x-test-auth': 'student' } })
					.its('body').then((items: any[]) => {
						const firstAssignmentId = items[0].id;
						cy.request({ method: 'POST', url: '/api/submissions', body: { assignment_id: firstAssignmentId, text: 'My answer' }, headers: { 'x-test-auth': 'student' } })
							.its('status').should('be.oneOf', [200, 201]);
						// Optional teacher grades
						cy.loginAs('teacher');
						cy.request({ method: 'GET', url: `/api/submissions?assignment_id=${firstAssignmentId}`, headers: { 'x-test-auth': 'teacher' } })
							.its('body').then((subs: any[]) => {
								const subId = subs[0].id;
								cy.request({ method: 'PATCH', url: `/api/submissions?id=${subId}`, body: { score: 95, feedback: 'Great job' }, headers: { 'x-test-auth': 'teacher' } })
									.its('status').should('be.oneOf', [200]);
							});
					});

				// Student list page renders
				cy.visit(`/dashboard/student/${course.id}/assignments`);
				cy.get('[data-testid="student-assignments-list"]').should('be.visible');
			});
		});
});


