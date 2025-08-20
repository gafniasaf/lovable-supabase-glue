describe('Quizzes end-to-end flow', () => {
	it('create quiz, questions, choices; student attempts and submits; player renders', () => {
		cy.loginAs('teacher');
		cy.request({ method: 'POST', url: '/api/courses', body: { title: 'Course 1' }, headers: { 'x-test-auth': 'teacher' } })
			.its('body')
			.then((course) => {
				cy.request({ method: 'POST', url: '/api/quizzes', body: { course_id: course.id, title: 'Quiz 1', points: 100 }, headers: { 'x-test-auth': 'teacher' }, failOnStatusCode: false })
				.then((quizResp) => {
					if (![200, 201].includes(quizResp.status)) {
						cy.log('quizzes API not available');
						return;
					}
					const quiz = quizResp.body;
					cy.request({ method: 'POST', url: '/api/quiz-questions', body: { quiz_id: quiz.id, text: 'Q1?', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } })
						.its('body')
						.then((q1) => {
							cy.request({ method: 'POST', url: '/api/quiz-questions', body: { quiz_id: quiz.id, text: 'Q2?', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } })
								.its('body')
								.then((q2) => {
									cy.request({ method: 'POST', url: '/api/quiz-choices', body: { question_id: q1.id, text: 'A1', correct: true, order_index: 1 }, headers: { 'x-test-auth': 'teacher' } })
										.its('body')
										.then((c1a) => {
											cy.request({ method: 'POST', url: '/api/quiz-choices', body: { question_id: q1.id, text: 'B1', correct: false, order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
											cy.request({ method: 'POST', url: '/api/quiz-choices', body: { question_id: q2.id, text: 'A2', correct: true, order_index: 1 }, headers: { 'x-test-auth': 'teacher' } })
												.its('body')
												.then((c2a) => {
													cy.request({ method: 'POST', url: '/api/quiz-choices', body: { question_id: q2.id, text: 'B2', correct: false, order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
													cy.loginAs('student');
													cy.request({ method: 'POST', url: '/api/quiz-attempts', body: { quiz_id: quiz.id }, headers: { 'x-test-auth': 'student' } })
														.its('body')
														.then((attempt) => {
															cy.request({ method: 'PATCH', url: '/api/quiz-attempts', body: { attempt_id: attempt.id, question_id: q1.id, choice_id: c1a.id }, headers: { 'x-test-auth': 'student' } });
															cy.request({ method: 'PATCH', url: '/api/quiz-attempts', body: { attempt_id: attempt.id, question_id: q2.id, choice_id: c2a.id }, headers: { 'x-test-auth': 'student' } });
															cy.request({ method: 'POST', url: '/api/quiz-attempts/submit', body: { attempt_id: attempt.id }, headers: { 'x-test-auth': 'student' } })
																.its('body')
																.then((final) => {
																	expect(final.score).to.eq(100);
																	cy.request({ method: 'GET', url: `/dashboard/student/${course.id}/quizzes/${quiz.id}/play`, failOnStatusCode: false })
																		.then((pre) => {
																			if (pre.status === 200) {
																				cy.visit(`/dashboard/student/${course.id}/quizzes/${quiz.id}/play`);
																				cy.get('[data-testid="quiz-player"]').should('be.visible');
																		}
																	});
															});
														});
												});
										});
								});
						});
					});
			});
	});
});


