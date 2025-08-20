# Gateway + Test Mode

Gateways centralize all data access in the web app and seamlessly switch between HTTP and Test implementations.

## How to enable Test Mode

- Server: set `TEST_MODE=1`
- Client: set `NEXT_PUBLIC_TEST_MODE=1` (for Storybook/dev)
- Storybook: `apps/web/.storybook/preview.tsx` wraps stories in `GatewayProvider`, which sets `window.__TEST_MODE__ = true`

Role switching in Test Mode:

- Send cookie or header `x-test-auth=teacher|student|parent|admin`
- SSR and route handlers echo this into downstream requests so gateways can act as if authenticated

## Seeding and utilities

- Seed data: `GET /api/test/seed?hard=1`
- Switch role: `POST /api/test/switch-role`

## Adding stories

- Place stories under `apps/web/src/stories/*.stories.tsx`
- Use MSW handlers defined in `apps/web/.storybook/preview.tsx` to mock API calls

## Gateways referenced in Test Mode

- RuntimeGateway: `/api/runtime/auth/exchange`, `/api/runtime/events`
- EnrollmentsGateway: `/api/enrollments/:id/launch-token`
- FilesGateway: `/api/files/upload-url` returns same-origin PUT URL in Test Mode


