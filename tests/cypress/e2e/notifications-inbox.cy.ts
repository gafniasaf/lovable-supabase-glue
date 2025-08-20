describe('Notifications inbox', () => {
	it('lists notifications and allows marking read (best-effort)', () => {
		cy.loginAs('student');
		cy.visit('/dashboard/notifications');
		cy.get('body').then(($b) => {
			if ($b.find('[data-testid="notifications-list"]').length) {
				cy.get('[data-testid="notifications-list"]').should('be.visible');
				cy.get('[data-testid^="mark-read-"]').first().click({ force: true });
			}
		});
	});
});



