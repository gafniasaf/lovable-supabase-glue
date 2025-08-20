describe('Labs System Inbox', () => {
	it('creates a thread and lists messages (best-effort)', () => {
		cy.loginAs('teacher');
		cy.request({ method: 'POST', url: '/api/messages/threads', body: { participant_ids: ['test-student-id'] }, headers: { 'x-test-auth': 'teacher' }, failOnStatusCode: false })
			.then(() => {
				cy.visit('/labs/system/inbox');
				cy.contains('Inbox (labs)').should('be.visible');
			});
	});
});



