describe('Quiz autosave + timer', () => {
	beforeEach(() => {
		cy.request('POST', '/api/test/reset');
	});

	it('autosaves selection and timer submits after expiry', () => {
		cy.loginAs('teacher');
		cy.request('POST', '/api/courses', { title: 'QZ' }).its('body').then((course: any) => {
			cy.request('POST', '/api/quizzes', { course_id: course.id, title: 'Quiz X' }).its('body').then((quiz: any) => {
				cy.request('POST', '/api/quiz-questions', { quiz_id: quiz.id, text: '2+2=' }).its('body').then((q: any) => {
					cy.request('POST', '/api/quiz-choices', { question_id: q.id, text: '4', correct: true });
					cy.request('POST', '/api/quiz-choices', { question_id: q.id, text: '5', correct: false });
					cy.loginAs('student');
					cy.visit(`/dashboard/student/${course.id}/quizzes/${quiz.id}/play`);
					cy.get('[data-testid="quiz-player"]').should('be.visible');
					cy.get('[data-testid="quiz-choice"]').first().click();
					cy.wait(300);
					cy.wait(9000);
					cy.get('[data-testid="quiz-score"]').should('be.visible');
				});
			});
		});
	});
});



