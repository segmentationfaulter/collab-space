# URL Structure Specification

This document defines the routing strategy for CollabSpace. We use a **Dynamic URL** approach where the URL serves as the primary "Source of Truth" for the application's context (multi-tenancy).

## 1. Multi-Tenancy Strategy

Every route within the application (post-login) is prefixed with an `orgSlug`. This ensures that:

- Users can bookmark specific workspaces.
- Deep links (e.g., to a task) work regardless of the user's current session state.
- Multi-tabbing between different workspaces is supported natively.

**Pattern:** `/[orgSlug]/...`

---

## 2. URL Hierarchy

### 2.1 Core Routes

| Route                                          | Description                              |
| :--------------------------------------------- | :--------------------------------------- |
| `/`                                            | Marketing Landing Page / Root Redirector |
| `/sign-in`                                     | Authentication: Sign In                  |
| `/sign-up`                                     | Authentication: Sign Up                  |
| `/[orgSlug]`                                   | Workspace Dashboard                      |
| `/[orgSlug]/members`                           | Member Management & Invitations          |
| `/[orgSlug]/settings`                          | Workspace Settings                       |
| `/[orgSlug]/boards/[boardSlug]`                | Board-specific Kanban view               |
| `/[orgSlug]/boards/[boardSlug]/tasks/[taskId]` | Individual Task Detail (nested)          |

### 2.2 Feature Routes (Future)

| Route              | Description                          |
| :----------------- | :----------------------------------- |
| `/[orgSlug]/tasks` | Global task view (Across all boards) |

---

## 3. Slugs vs. IDs

To balance aesthetics and reliability, we follow these rules:

1. **Slugs (Human Readable):** Used for top-level entities like **Organizations** and **Boards**.
   - _Example:_ `/acme-corp/boards/engineering-tasks`
   - _Reason:_ Better for branding and UX.
2. **IDs (UUIDs/Opaque IDs):** Used for granular resources like **Tasks** or **Comments**.
   - _Example:_ `/acme-corp/boards/engineering-tasks/tasks/tks_01J2H`
   - _Reason:_ Prevents links from breaking when titles are renamed.

---

## 4. Query Parameters (UI State)

State that modifies the current view without changing the underlying page context is stored in query parameters.

- **Filters:** `?status=todo&priority=high`
- **Sorting:** `?sort=created_at_desc`
- **Search:** `?q=login+issue`
- **Modals:** `?taskId=123` (Allows the "Back" button to close a modal).

---

## 5. Implementation Notes

- **Redirector:** The root `/` route (when authenticated) should automatically redirect the user to their last active `orgSlug` (e.g., `/acme-corp`).
- **Middleware:** Next.js Middleware should verify that the authenticated user has permission to access the `orgSlug` provided in the URL.
- **Link Components:** All internal links within a workspace must be prefixed with the current `orgSlug`.
