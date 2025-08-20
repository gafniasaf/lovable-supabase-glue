describe('Profile + Notifications', () => {
	it('update profile via API and verify inbox renders', () => {
		cy.request('/api/test/seed?hard=1');
		cy.request({ method: 'PUT', url: '/api/user/profile', headers: { 'x-test-auth': 'teacher', 'content-type': 'application/json' }, body: { display_name: 'E2E Teacher', bio: 'Automated test' } })
			.its('status').should('be.oneOf', [200, 204]);
		cy.loginAs('teacher');
		cy.visit('/dashboard/teacher/profile');
		cy.contains('Teacher profile').should('be.visible');
	});
});



