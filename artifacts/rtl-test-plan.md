RTL Test Plan (Draft)

Notifications
- List: renders items; empty state; error with requestId.
- Actions: mark read/all dispatches gateway calls and updates list/badge.
- Preferences: toggling saves via gateway; optimistic UI; error rollbacks.

Settings
- Profile form: validation errors; optimistic save; displays requestId on error.
- Notifications prefs: see above.

Analytics
- Teacher course analytics: loading skeleton; chart renders under 500ms for small data; fallback table when large; error state.
- Admin reports: cards show counts; CSV links present.

Student
- Timeline/Plan: concurrent lessons fetch; skeleton; empty; error inline message; mark-complete triggers gateway and revalidate.

Parent
- Announcements: list/pagination; empty state.

Accessibility
- Integrate axe checks; zero critical violations.

Test IDs
- continue-learning mark-complete, notifications mark read/all, settings save buttons, analytics CSV link.



