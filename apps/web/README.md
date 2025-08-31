# Apps/Web  Edu UI Integration Guide

This app hosts the presentational Education UI inside the legacy Next.js application.

## Quick start

- Install (from repo root):
  - `npm --workspace apps/web install`
- Dev (from this directory):
  - `npm run dev`
- Build (from this directory):
  - `npm run build`

## Tests (TDD-first)

- From repo root: `npm test -- --runInBand`
- Jest runs UI tests under `apps/web/src/edu/__tests__`.
- CI helpers capture output into `artifacts/ui/*.txt`.

## Project structure (UI)

```
apps/web/src/
  app/edu/                 # App Router pages
    layout.tsx            # Uses AppShell (client)
    assignments/page.tsx
    courses/page.tsx
    lessons/page.tsx
    sandbox/page.tsx      # Renders DevSandbox
  components/
    ui/                   # UI primitives used by header/sidebar
      Button.tsx
      Badge.tsx
      dropdown-menu.tsx
      sidebar.tsx
    edu/
      components/
        AppShell.tsx
        Header.tsx
        Breadcrumbs.tsx
        ToastProvider.tsx
      pages/
        assignments/AssignmentsList.tsx
        courses/CoursesList.tsx
        lessons/LessonsList.tsx
      DevSandbox.tsx
```

- Import alias `@/*` resolves to `apps/web/src/*` (see `apps/web/tsconfig.json`).

## Current UI primitives and shell

- Header: title, primary nav (`/edu/{assignments,courses,lessons}`), search, actions dropdown, notifications badge, breadcrumbs.
- AppShell: wraps pages with Header and ToastProvider/ToastHost.
- Pages: assignments, courses, lessons, sandbox  all prerendered.
- Tables: minimal demo tables (courses) with sorting; assignments includes a search filter.
- Toasts: `ToastProvider`, `useToast`, `ToastHost` for simple status messages.

## Adding a page (TDD flow)

1) Create a failing test in `apps/web/src/edu/__tests__/YourPage.test.tsx`:
```
import { render, screen } from '@testing-library/react';
import Page from '@/app/edu/your-page/page';

test('renders header', () => {
  render(<Page /> as any);
  expect(screen.getByRole('heading', { name: /Your Header/i })).toBeInTheDocument();
});
```
2) Implement the page under `apps/web/src/app/edu/your-page/page.tsx` and any presentational component under `apps/web/src/edu/pages/...`.
3) Run `npm test` and iterate until green.
4) Run `npm run build` from `apps/web`  ensure a green build before merging.

## Adding components to Header/AppShell

- Extend `apps/web/src/edu/components/Header.tsx` with nav or controls.
- Keep it presentational; business logic should live in future adapters/hooks.
- Prefer small tests in `__tests__` to lock visible behavior before adding code.

## Sandbox

- `/edu/sandbox` renders `DevSandbox` for rapid iteration of UI primitives and layouts.

## Notes

- Keep changes presentational and SSR-safe (use client) where needed.
- Favor minimal state and explicit props; wire to data later.
- When adding new aliases or directories, update `apps/web/tsconfig.json` and Tailwind content globs if needed.
