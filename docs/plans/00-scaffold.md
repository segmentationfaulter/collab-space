# Plan: 00-scaffold (Project Initialization)

## Goals
- Initialize the Monorepo structure using Turborepo.
- specific Next.js 16 application Setup with Tailwind v4.
- Configure local infrastructure (Docker Compose for Postgres/Redis).
- Set up Drizzle ORM and verify database connection.
- Set up the Testing Harness (Vitest + Playwright).

## Tasks

### Task 1: Monorepo & Next.js Init
- [x] Initialize Turborepo (using `pnpm`).
- [x] Create `apps/web` (Next.js 16, React 19.x, TS).
- [x] Configure Tailwind v4 in `apps/web`.
- [x] Clean up default boilerplate code.
- **Verification:** `pnpm dev` starts the web app and it renders a blank page with Tailwind styles working.

### Task 2: Local Infrastructure
- [ ] Create `docker-compose.yml` in root.
- [ ] Define `postgres` service (alpine image).
- [ ] Define `redis` service (alpine image).
- [ ] Add `.env.example` and `.env` for local secrets.
- **Verification:** `docker-compose up -d` starts both services without error.

### Task 3: Database & ORM Setup
- [ ] Install Drizzle ORM, `drizzle-kit`, and `postgres` driver in `apps/web`.
- [ ] Create `drizzle.config.ts`.
- [ ] Create basic `db/index.ts` connection client.
- [ ] Create a "dummy" schema (e.g., `schema.ts` with a `users` table) just to test connection.
- [ ] Run a migration push.
- **Verification:** `pnpm db:push` succeeds and creates the table in the local Postgres container.

### Task 4: Testing Infrastructure
- [ ] Install Vitest in `apps/web`.
- [ ] Create `vitest.config.ts`.
- [ ] Create a dummy unit test (`sum.test.ts`).
- [ ] Install Playwright.
- [ ] Create `playwright.config.ts`.
- [ ] Create a dummy E2E test (visits homepage).
- **Verification:** `pnpm test` runs unit tests and `pnpm test:e2e` runs Playwright tests successfully.
