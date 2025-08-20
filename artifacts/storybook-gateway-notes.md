Storybook: GatewayProvider Usage (Draft)

Setup
- Add a Storybook decorator to wrap stories with `GatewayProvider` in `mode="test"`.
- Provide TestGateways for Notifications, Profiles, Reports, Lessons, Enrollments, Announcements.

Patterns
- Simulate async delays with `await new Promise(r => setTimeout(r, 50))` in test gateways.
- Use controls to toggle empty/error states.
- Add `play` functions to exercise: mark read/all, save profile/prefs, navigate tabs.

Components/Pages to Cover
- NotificationsDropdown, Settings/Profile form, StudentDashboard, TeacherDashboard, Grading queue, Interactive embed states.

Accessibility
- Add axe checks via `@axe-core/playwright` in a dedicated test target for new pages.



