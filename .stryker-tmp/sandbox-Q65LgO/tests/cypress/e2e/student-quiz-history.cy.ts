// @ts-nocheck
describe('Student quiz history', () => {
	it('shows latest quiz score when submitted', () => {
		// Teacher seeds course and quiz
		cy.loginAs('teacher');
		cy.request({ method: 'POST', url: '/api/courses', body: { title: 'Course H' }, headers: { 'x-test-auth': 'teacher' } }).its('body').then((course: any) => {
			cy.request({ method: 'POST', url: '/api/quizzes', body: { course_id: course.id, title: 'Quiz H', points: 100 }, headers: { 'x-test-auth': 'teacher' } }).its('body').then((quiz: any) => {
				// Create a question and a correct choice
				cy.request({ method: 'POST', url: '/api/quiz-questions', body: { quiz_id: quiz.id, text: '2+2?', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } }).its('body').then((q: any) => {
					cy.request({ method: 'POST', url: '/api/quiz-choices', body: { question_id: q.id, text: '4', correct: true, order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
					// Student enrolls and takes quiz
					cy.loginAs('student');
					cy.request({ method: 'POST', url: '/api/enrollments', body: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
					cy.request({ method: 'POST', url: '/api/quiz-attempts', body: { quiz_id: quiz.id }, headers: { 'x-test-auth': 'student' } }).its('body').then((attempt: any) => {
						// Answer correctly: find first choice for q
						cy.request({ method: 'GET', url: `/api/quiz-choices?question_id=${q.id}`, headers: { 'x-test-auth': 'student' } }).its('body').then((choices: any[]) => {
							const correct = choices[0];
							cy.request({ method: 'PATCH', url: '/api/quiz-attempts', body: { attempt_id: attempt.id, question_id: q.id, choice_id: correct.id }, headers: { 'x-test-auth': 'student' } });
							cy.request({ method: 'POST', url: '/api/quiz-attempts/submit', body: { attempt_id: attempt.id }, headers: { 'x-test-auth': 'student' } });
							// Visit history page
							cy.visit(`/dashboard/student/${course.id}/quizzes/history`);
							cy.get('[data-testid="quiz-history-list"]').should('be.visible');
							cy.get('[data-testid="history-row"]').should('have.length', 1);
							cy.get('[data-testid="history-quiz-title"]').should('have.text', 'Quiz H');
							cy.get('[data-testid="history-score"]').invoke('text').should('not.eq', '-');
						});
					});
				});
			});
		});
	});
});


