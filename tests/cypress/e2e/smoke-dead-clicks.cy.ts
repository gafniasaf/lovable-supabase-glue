describe('Smoke dead-click killers', () => {
	it('header shows Dashboard link', () => {
		cy.visit('/');
		cy.get('header[role="banner"]').find('a[aria-label="Dashboard home"]').should('be.visible');
	});

	it('teacher dashboard Add course link opens create route (if present)', () => {
		cy.loginAs('teacher');
		cy.visit('/dashboard/teacher');
		cy.get('body').then(($b) => {
			const link = $b.find('a:contains("Add course"), a:contains("New course"), a:contains("Create course")').first();
			if (link.length) {
				cy.wrap(link).click({ force: true });
				cy.url().should('match', /dashboard\/teacher\/(courses\/new|new|courses\/create)/);
			}
		});
	});
});



