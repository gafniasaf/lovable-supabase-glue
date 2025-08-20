// @ts-nocheck
declare global {
	namespace Cypress {
		interface Chainable {
			loginAs(role: 'teacher' | 'student' | 'parent' | 'admin'): Chainable<void>;
		}
	}
}

Cypress.Commands.add('loginAs', (role: 'teacher' | 'student' | 'parent' | 'admin') => {
	cy.setCookie('x-test-auth', role);
});

export {};


