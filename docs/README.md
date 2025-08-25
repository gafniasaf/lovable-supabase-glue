# Documentation Index

- See `DEPLOYMENT.md` for Vercel guidance and build settings
- See `HOW_TO_RUN.md` for Docker Compose workflows and E2E JSON reports
- See `testing.md` for E2E test mode and JSON reporting
- See `ui-ux.md` for design system and component guidance
- See `CHANGELOG.md` for latest changes

## Vercel + v0 integration

- Vercel is configured via `vercel.json` at the repo root to build the monorepo Next.js app (`apps/web`) and to ignore Husky scripts during install.
- v0-generated UI lives under `apps/web/src/ui/v0/` and is governed by:
  - `.github/workflows/v0-pr.yml` — runs `tools/v0-scan.js`, typecheck, lint, and build on PRs that touch v0 files
  - `tools/v0-scan.js` — forbids imports from external UI libraries (e.g., MUI, AntD, Chakra, shadcn), forbids inline `fetch()`; requires presentational-only components
  - `.github/CODEOWNERS` — routes v0 UI reviews to the designated owner(s)
- Use `tools/v0-import.js` to import a single component from a public GitHub repo (v0 export) into `apps/web/src/ui/v0/`.
- All v0 PRs must pass CI gates and E2E smoke before merge.
