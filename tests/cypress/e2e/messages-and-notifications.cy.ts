describe('Messages and Notifications', () => {
	it('create thread, send message, list messages, list notifications (test-mode)', () => {
		cy.loginAs('teacher');
		cy.request({ method: 'POST', url: '/api/messages/threads', body: { participant_ids: ['test-student-id'] }, headers: { 'x-test-auth': 'teacher' } })
			.its('body').then((thread: any) => {
				cy.request({ method: 'POST', url: '/api/messages', body: { thread_id: thread.id, body: 'Hello there' }, headers: { 'x-test-auth': 'teacher' } })
					.its('status').should('be.oneOf', [200, 201]);
				cy.request({ method: 'GET', url: `/api/messages?thread_id=${thread.id}`, headers: { 'x-test-auth': 'teacher' } })
					.its('body').then((messages: any[]) => {
						expect(messages.length).to.be.greaterThan(0);
					});
				cy.request({ method: 'GET', url: '/api/notifications', headers: { 'x-test-auth': 'teacher' } })
					.its('body').then((notes: any[]) => {
						expect(Array.isArray(notes)).to.eq(true);
					});
			});
	});
});
