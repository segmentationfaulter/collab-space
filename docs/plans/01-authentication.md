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

- [x] Enable `username` plugin in `apps/web/src/lib/auth.ts`.
- [x] Update database schema to support usernames.
- [x] Update SignUp UI to collect username.
- **Verification:** User has a unique username after signup.

### Task 5: Organizations (Multi-tenancy)

#### Task 5.1: Organization Configuration & Access Control

- [x] Confirm default roles (`owner`, `admin`, `member`) alignment with project requirements.
- [x] Ensure `auth.ts` and `auth-client.ts` are synchronized with the same plugin config.
- **Verification:** Logged-in user session includes organization-related fields.

#### Task 5.2: Workspace Management UI (Create & Switch)

- [ ] Create `OrganizationSwitcher` component for the navigation bar.
- [ ] Implement `CreateOrganization` dialog/form.
- [ ] Update session handling to reflect the `activeOrganization`.
- **Verification:** User can create a workspace and switch between multiple workspaces.

#### Task 5.3: Invitation System

- [ ] Implement "Invite Member" UI (email + role selection).
- [ ] Implement `AcceptInvitation` page logic (`apps/web/src/app/accept-invitation/[id]/page.tsx`).
- [ ] Add "Members" management view to list and remove organization members.
- **Verification:** An invited user can join the organization via the invitation link.

### Task 6: Integration & Protection (tRPC & Middleware)

- [ ] Create a `protectedProcedure` in tRPC that uses Better Auth session.
- [ ] Implement Granular Middlewares:
  - [ ] `workspaceMemberProcedure`: Ensures user belongs to the current organization.
  - [ ] `workspaceOwnerProcedure`: Ensures user is an Owner or Admin.
- [ ] Update tRPC context to include the `activeOrganizationId`.
- [ ] Update the homepage to show user info and current workspace, or redirect to login.
- [ ] Add a Vitest test for the auth-protected tRPC procedure.
- [ ] Add a Playwright E2E test for the full Sign-up -> Create Workspace -> Invite Member flow.
- **Verification:** `pnpm test` and `pnpm test:e2e` pass.
