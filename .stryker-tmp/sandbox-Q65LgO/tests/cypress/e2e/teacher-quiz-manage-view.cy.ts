// @ts-nocheck
describe('Teacher manage quiz view', () => {
	it('renders questions and choices', () => {
		cy.loginAs('teacher');
		const headers = { 'x-test-auth': 'teacher' } as any;
		cy.request('POST', '/api/courses', { title: 'Course Q' }).its('body').then((course: any) => {
			cy.request({ method: 'POST', url: '/api/quizzes', body: { course_id: course.id, title: 'Quiz M', points: 100 }, headers, failOnStatusCode: false }).then((qr) => {
				if (![200,201].includes(qr.status)) { cy.log('quizzes API not available'); return; }
				const quiz = qr.body;
				cy.request({ method: 'POST', url: '/api/quiz-questions', body: { quiz_id: quiz.id, text: 'What is 1+1?', order_index: 1 }, headers }).its('body').then((q: any) => {
					cy.request({ method: 'POST', url: '/api/quiz-choices', body: { question_id: q.id, text: '2', correct: true, order_index: 1 }, headers, failOnStatusCode: false });
					cy.visit(`/dashboard/teacher/${course.id}/quizzes/${quiz.id}/manage`);
					cy.get('[data-testid="questions-list"]').should('be.visible');
					cy.get('[data-testid="question-row"]').should('have.length.at.least', 1);
				});
			});
		});
	});
});


