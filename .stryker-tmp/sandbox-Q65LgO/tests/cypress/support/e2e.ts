// @ts-nocheck
// Reset test store before each test to isolate specs
beforeEach(() => {
	cy.request({ method: 'GET', url: '/api/health', failOnStatusCode: false });
	cy.request('POST', '/api/test/reset').then((resp) => {
		if (resp.status === 404) {
			cy.request('POST', '/api/__test__/reset');
		}
	});
});

import './commands';


