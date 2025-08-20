// @ts-nocheck
describe('Parent announcements view', () => {
	it('shows course announcements when course_id provided', () => {
		cy.loginAs('teacher');
		const headers = { 'x-test-auth': 'teacher' } as any;
		cy.request({ method: 'POST', url: '/api/courses', body: { title: 'Course P' }, headers }).its('body').then((course: any) => {
			cy.request({ method: 'POST', url: '/api/announcements', body: { course_id: course.id, title: 'Hello', body: 'Parents welcome' }, headers });
			cy.loginAs('parent');
			cy.visit(`/labs/parent/announcements?course_id=${course.id}`);
			cy.get('[data-testid="parent-ann-section"]').should('be.visible');
			cy.contains('Hello').should('be.visible');
		});
	});
});


