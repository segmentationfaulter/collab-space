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

- [x] Configure `vercel.json` (no custom config needed for now).
- [x] Document and prepare Environment Variables (updated `.env.example` and created `.env.production` template).
- [x] Update `.gitignore` to safely handle local production templates (`.env*`).
- [ ] Connect GitHub repository to Vercel and enable "Automatically expose System Environment Variables" (Manual step).
- **Verification:** Initial deployment succeeds on Vercel and the app is accessible.

### Task 3: Database Migrations in CI/CD

- [x] Configure Drizzle Kit to use migrations (created `drizzle/` directory).
- [x] Update `package.json` with `db:generate` and `db:migrate` (using `drizzle-kit migrate`).
- [x] Update Build Command to `pnpm db:migrate && next build` in `package.json`.
- **Verification:** Migrations run successfully against the local database using `pnpm db:migrate`.

### Task 4: Background Jobs (Inngest Cloud)

- [ ] Connect the Vercel app to Inngest Cloud.
- [ ] Configure `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in Vercel.
- **Verification:** Verify that background jobs (like invitations) work in the deployed environment.
