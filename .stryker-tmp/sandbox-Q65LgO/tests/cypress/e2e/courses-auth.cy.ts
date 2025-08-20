// @ts-nocheck
describe('Courses auth', () => {
	it('teacher creates a course and it appears in dashboard (test-mode)', () => {
		cy.request('POST', '/api/test/reset');
		cy.loginAs('teacher');
		const title = `Course ${Date.now()}`;
		cy.request({ method: 'POST', url: '/api/courses', body: { title, description: 'D' }, headers: { 'x-test-auth': 'teacher' } })
			.its('status').should('be.oneOf', [200, 201]);
		cy.request({ method: 'GET', url: '/api/courses', headers: { 'x-test-auth': 'teacher' } })
			.its('body').then((items: any[]) => {
				expect(items.map((c) => c.title)).to.include(title);
			});
		cy.visit('/dashboard/teacher');
		cy.contains('h1', 'Your courses').should('be.visible');
		cy.contains('a', title).should('be.visible');
	});
});


