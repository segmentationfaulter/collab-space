# Plan: 01-authentication (Auth & API Foundation)

## Goals

- Establish tRPC end-to-end type safety.
- Setup Better Auth with Drizzle ORM.
- Implement Credentials (Email/Password) and GitHub OAuth.
- Enable the Organizations plugin for multi-tenancy (Workspaces).
- Create basic Login/Signup UI.

## Tasks

### Task 1: tRPC Setup

- [ ] Install `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/next`, and `zod`.
- [ ] Initialize tRPC on the server (`apps/web/src/server/trpc.ts`).
- [ ] Create the root router and a `public` vs `protected` procedure logic.
- [ ] Setup tRPC React provider in `apps/web/src/app/layout.tsx`.
- **Verification:** Create a `hello` procedure and call it from the homepage.

### Task 2: Better Auth Setup

- [ ] Install `better-auth`.
- [ ] Configure `auth` instance in `apps/web/src/lib/auth.ts` with Drizzle adapter.
- [ ] Enable `organizations` and `username` plugins.
- [ ] Define Better Auth tables in `apps/web/src/db/schema.ts` (mapping required tables).
- [ ] Configure GitHub OAuth (Environment variables).
- [ ] Set up the API route handler (`apps/web/src/app/api/auth/[...all]/route.ts`).
- **Verification:** Run `pnpm db:push` to ensure tables are created and `auth.api.getSession()` works.

### Task 3: Authentication UI

- [ ] Install `lucide-react` and `shadcn/ui` components (Button, Input, Card, Form).
- [ ] Implement `SignUp` page (Email, Username, Password).
- [ ] Implement `Login` page.
- [ ] Implement "Logout" button in a basic dashboard header.
- **Verification:** Manually sign up a user and verify their record exists in the database.

### Task 4: Integration & Protection

- [ ] Create a `protectedProcedure` in tRPC that uses Better Auth session.
- [ ] Update the homepage to show user info if logged in, or redirect to login.
- [ ] Add a Vitest test for the auth-protected tRPC procedure.
- [ ] Add a Playwright E2E test for the full Sign-up -> Login -> Dashboard flow.
- **Verification:** `pnpm test` and `pnpm test:e2e` pass.
