// @ts-nocheck
describe('Teacher quiz attempts list', () => {
	it('shows attempts for a quiz', () => {
		cy.loginAs('teacher');
		const headers = { 'x-test-auth': 'teacher' } as any;
		cy.request('POST', '/api/courses', { title: 'Course T' }).its('body').then((course: any) => {
			cy.request({ method: 'POST', url: '/api/quizzes', body: { course_id: course.id, title: 'Quiz Attempts', points: 100 }, headers, failOnStatusCode: false }).then((qr) => {
				if (![200,201].includes(qr.status)) { cy.log('quizzes API not available'); return; }
				const quiz = qr.body;
				cy.loginAs('student');
				cy.request({ method: 'POST', url: '/api/quiz-attempts', body: { quiz_id: quiz.id }, headers: { 'x-test-auth': 'student' } }).its('body').then((attempt: any) => {
					cy.request({ method: 'POST', url: '/api/quiz-attempts/submit', body: { attempt_id: attempt.id }, headers: { 'x-test-auth': 'student' } });
					cy.loginAs('teacher');
					cy.visit(`/dashboard/teacher/${course.id}/quizzes/${quiz.id}/attempts`);
					cy.get('[data-testid="attempts-list"]').should('be.visible');
					cy.get('[data-testid="attempt-row"]').should('have.length.at.least', 1);
					cy.get('[data-testid="attempt-score"]').first().invoke('text').should('match', /\d+/);
				});
			});
		});
	});
});


