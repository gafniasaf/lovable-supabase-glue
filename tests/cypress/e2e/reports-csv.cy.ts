describe('Reports CSV export', () => {
	it('returns CSV for outcomes export (when enabled)', () => {
		if (!Cypress.env('RUNTIME_API_V2') && !window?.process?.env?.RUNTIME_API_V2) {
			// Skip when runtime v2 is not enabled
			return;
		}
		cy.loginAs('teacher');
		cy.request('POST', '/api/courses', { title: 'R' }).its('body').then((course: any) => {
			cy.request({ method: 'GET', url: `/api/runtime/outcomes/export?course_id=${course.id}`, headers: { 'x-test-auth': 'teacher' } })
				.its('headers').then((h: any) => {
					expect((h['content-type'] || h['Content-Type'] || '')).to.contain('text/csv');
				});
		});
	});
});



