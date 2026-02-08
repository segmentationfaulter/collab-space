# Plan: 01-authentication (Auth & API Foundation)

## Goals

- Establish tRPC end-to-end type safety.
- Setup Better Auth with Drizzle ORM.
- Implement Credentials (Email/Password) and GitHub OAuth.
- Enable the Organizations plugin for multi-tenancy (Workspaces).
- Create basic Login/Signup UI.

## Tasks

### Task 1: tRPC Setup

- [x] Install `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@trpc/next`, and `zod`.
- [x] Initialize tRPC on the server (`apps/web/src/server/trpc.ts`).
- [x] Create the root router and a `public` vs `protected` procedure logic.
- [x] Setup tRPC React provider (in `apps/web/src/components/providers.tsx`).
- **Verification:** Create a `hello` procedure and call it from the homepage.

### Task 2: Email/Password Authentication

- [x] Configure `auth` instance in `apps/web/src/lib/auth.ts` (Core + Email/Pass only).
- [x] Define basic User, Session, Account, Verification tables in `apps/web/src/db/schema.ts`.
- [x] Set up the API route handler (`apps/web/src/app/api/auth/[...all]/route.ts`).
- [x] Install `lucide-react` and `shadcn/ui` components (Button, Input, Card, Form).
- [x] Implement `SignUp` page (Email, Password).
- [x] Implement `Login` page.
- [x] Implement "Logout" button.
- **Verification:** User can sign up, login, and see their session persist.

### Task 3: Social Login (GitHub)

- [x] Add GitHub provider to `apps/web/src/lib/auth.ts`.
- [x] Configure Environment variables.
- [x] Update Login/Signup UI to include "Continue with GitHub".
- **Verification:** User can login with GitHub account.

### Task 4: Usernames

- [ ] Enable `username` plugin in `apps/web/src/lib/auth.ts`.
- [ ] Update database schema to support usernames.
- [ ] Update SignUp UI to collect username.
- **Verification:** User has a unique username after signup.

### Task 5: Organizations

- [ ] Enable `organization` plugin in `apps/web/src/lib/auth.ts`.
- [ ] Update database schema for Organizations, Members, Invitations.
- [ ] Create UI for creating/switching organizations.
- **Verification:** User can create an organization and invite members.

### Task 6: Integration & Protection

- [ ] Create a `protectedProcedure` in tRPC that uses Better Auth session.
- [ ] Update the homepage to show user info if logged in, or redirect to login.
- [ ] Add a Vitest test for the auth-protected tRPC procedure.
- [ ] Add a Playwright E2E test for the full Sign-up -> Login -> Dashboard flow.
- **Verification:** `pnpm test` and `pnpm test:e2e` pass.
