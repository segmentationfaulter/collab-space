# Plan: 04-deployment (CI/CD & Deployment)

## Goals

- Establish a robust CI/CD pipeline using GitHub Actions.
- Ensure codebase quality through automated linting, type-checking, and testing.
- Configure deployment to Vercel with managed database and background job integration.
- Implement automated database migrations.

## Tasks

### Task 1: GitHub Actions Workflow

- [x] Create `.github/workflows/ci.yml`.
- [x] Implement `lint` job: Run `pnpm lint`.
- [x] Implement `type-check` job: Run `pnpm tsc --noEmit`.
- [x] Implement `test` job: Run `pnpm test` (Vitest).
- [x] Implement `build` job: Run `pnpm build` to ensure the project compiles.
- **Verification:** Push a commit and verify all jobs pass in the GitHub Actions tab.

### Task 2: Vercel Project Setup

- [ ] Configure `vercel.json` if custom routing or headers are needed.
- [ ] Set up Environment Variables in Vercel (matching `.env.example`).
- [ ] Connect GitHub repository to Vercel for automatic deployments.
- **Verification:** Initial deployment succeeds on Vercel and the app is accessible.

### Task 3: Database Migrations in CI/CD

- [ ] Configure Drizzle Kit to run migrations as part of the deployment flow.
- [ ] Ensure `db:push` or a migration script runs safely against the production database.
- **Verification:** Add a small schema change, push it, and verify the production database reflects the change.

### Task 4: Background Jobs (Inngest Cloud)

- [ ] Connect the Vercel app to Inngest Cloud.
- [ ] Configure `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in Vercel.
- **Verification:** Verify that background jobs (like invitations) work in the deployed environment.
