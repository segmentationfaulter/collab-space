# Knowledge Base: TanStack Query vs. React Server Components

This document explains why CollabSpace utilizes **TanStack Query** (via tRPC) even though **React Server Components (RSC)** can fetch data directly using `fetch`.

## 1. The Core Distinction

In a modern Next.js application, we manage two types of data fetching:

1.  **Server-Side Fetching (RSC):** Best for the "Initial Load." It handles SEO, speed, and static content.
2.  **Client-Side State Management (TanStack Query):** Best for the "Interactive Application." It handles everything that happens _after_ the page has landed in the browser.

---

## 2. Comparison Table

| Feature             | React Server Components (`fetch`) | TanStack Query (`useQuery`)         |
| :------------------ | :-------------------------------- | :---------------------------------- |
| **Execution**       | Server-only                       | Client (with SSR support)           |
| **Interactivity**   | Low (requires navigation/refresh) | **High** (dynamic updates)          |
| **Caching**         | Server-side (Request-based)       | **Client-side** (Persistent/Global) |
| **Optimistic UI**   | Hard to implement                 | **Native Support**                  |
| **Background Sync** | No                                | **Yes** (on focus/reconnect)        |
| **Use Case**        | Dashboards, Blog posts, SEO       | Kanban boards, Modals, Forms        |

---

## 3. Why CollabSpace Needs TanStack Query

While RSC is powerful, a collaboration tool like CollabSpace requires features that RSC cannot provide efficiently:

### A. The "Linear" Feel (Optimistic Updates)

In a Kanban board, when a user drags a task from "Todo" to "Done," they expect the UI to move **instantly**.

- **Without TSQ:** The user waits for the server to confirm the move before the UI updates.
- **With TSQ:** We update the local cache immediately. If the server fails, TSQ automatically rolls back the task to its original position.

### B. Background Synchronization

CollabSpace is a multi-user environment. If a teammate moves a task while you have the app open:

- **TanStack Query** can be configured to "Refetch on Window Focus." The moment you click back into the CollabSpace tab, it silently synchronizes the local state with the server.

### C. Client-Side Data Deduplication

If three different UI components (e.g., a Sidebar, a Header, and a Profile Page) all need the same `activeOrganization` data:

- **RSC** might require passing that data down through many layers of components (Prop Drilling).
- **TSQ** allows all three components to call the same hook. It ensures only **one** network request is made, and all components share the same cached result.

### D. Declarative Loading and Error States

TSQ provides built-in `isLoading`, `isError`, and `data` flags. This eliminates the need for manual `useState` and `useEffect` boilerplate to handle the "lifecycle" of an API request.

---

## 4. When to Use Which?

- **Use RSC + `fetch`:** For the initial layout and "Read-Only" data that doesn't change based on user interaction on the current page.
- **Use tRPC + TanStack Query:** For any data that the user interacts with, reorders, or expects to stay fresh in real-time without a full page reload.
