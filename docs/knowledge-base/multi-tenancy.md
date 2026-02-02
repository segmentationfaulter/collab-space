# Knowledge Base: Multi-Tenancy in CollabSpace

This document explains the concept of multi-tenancy as applied to CollabSpace and compares a manual implementation against the automated approach using **Better Auth**.

## 1. What is Multi-Tenancy?

Multi-tenancy is an architecture where a single instance of an application serves multiple groups of users (tenants). In CollabSpace, each **Workspace** is a tenant.

### Core Requirements:

- **Data Isolation:** Users in Workspace A must never see data from Workspace B.
- **Membership:** A user can be a member of multiple workspaces.
- **Roles:** A user can have different permissions (Owner, Admin, Member) in different workspaces.
- **Invitations:** A way to bring new users into a specific workspace.

---

## 2. Manual Implementation (The "Hard" Way)

If we were to build this manually, we would need to manage the following:

### Database Schema

We would need to define and maintain several tables and relationships:

- `workspaces`: `id`, `name`, `slug`, `createdAt`
- `members`: `id`, `userId`, `workspaceId`, `role`, `joinedAt`
- `invitations`: `id`, `email`, `workspaceId`, `token`, `expiresAt`, `status`

### Application Logic

- **Middleware:** Every API request would need a check: `SELECT * FROM members WHERE userId = $1 AND workspaceId = $2`.
- **Context Management:** The frontend would need to track the "Active Workspace ID" and include it in every request.
- **Invite Flow:**
  1. Generate a unique cryptographically secure token.
  2. Store it with an expiration date.
  3. Create a route to validate the token.
  4. Handle the transition from "Invited" to "Member".

### Security Risks

- **IDOR (Insecure Direct Object Reference):** Forgetting a `WHERE workspace_id = ...` clause in a single query could leak private data to other tenants.

---

## 3. Better Auth Organizations (The "Automated" Way)

**Better Auth** provides an `organizations` plugin that handles the heavy lifting out of the box.

### Automatic Schema

The plugin manages the tables for us:

- It creates/maps `organization`, `member`, and `invitation` tables.
- It handles the complex many-to-many relationship between Users and Organizations.

### Built-in API

Instead of writing custom SQL, we use battle-tested methods:

- `auth.organization.create(...)`: Handles workspace creation.
- `auth.organization.inviteMember(...)`: Handles token generation and status tracking.
- `auth.organization.setActive(...)`: Manages the active workspace session.

### Integrated Security

- **Session Awareness:** The session object automatically includes the `activeOrganizationId`.
- **Role-Based Access Control (RBAC):** Built-in helpers to check if the user is an `owner` or `admin` without manual database lookups on every request.

## Summary

By using Better Auth, we reduce the surface area for security bugs and significantly decrease the amount of "boilerplate" code, allowing us to focus on the unique collaborative features of CollabSpace.
