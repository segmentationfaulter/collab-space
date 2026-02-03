# ADR 002: Use TanStack Query for Server State Management

## Status

Accepted

## Context

While tRPC handles the "transport" and "type safety" of our API, it doesn't solve the problem of managing the **lifecycle** of that data on the client. Without a dedicated manager, developers often resort to `useEffect` and `useState` hooks, which lead to:

- "Loading Spinners" flashing on every navigation.
- Inconsistent data across different parts of the UI.
- Complex logic for refetching data when a window is refocused.
- Difficulties implementing "Optimistic Updates" (showing a change before the server confirms it).

## Decision

We will use **TanStack Query** (integrated via tRPC) as the primary engine for server state management.

## Problem Solved

1. **Caching & Revalidation:** It stores API responses in a global cache. If two components need the same "User" data, they share the same cached result instead of hitting the API twice.
2. **Stale-While-Revalidate:** It allows the UI to show "old" data instantly while fetching "fresh" data in the background, making the app feel significantly faster.
3. **Automatic Background Refetching:** It automatically refreshes data when the user refocuses the window or reconnects to the internet (critical for our "Collaboration" goals).
4. **Declarative Mutations:** It simplifies the process of updating data and provides a structured way to handle success, error, and "Optimistic" UI updates.

## How it Solves it

- **Query Keys:** Every request is tagged with a unique key (managed automatically by tRPC). This key acts as the address in the cache.
- **Cache Lifecycle:** We can configure how long data should stay "fresh" before a background refetch is triggered.
- **Mutation Hooks:** It provides `onMutate`, `onSuccess`, and `onError` callbacks to precisely manage what the user sees during a data change.

## Code Example: Optimistic Update

In CollabSpace, when a user moves a task, we want the task to jump to the new column _instantly_, even if the API takes 500ms to respond.

```typescript
const utils = trpc.useUtils();

const moveTask = trpc.task.move.useMutation({
  async onMutate(newTask) {
    // 1. Cancel outgoing fetches (so they don't overwrite our optimistic update)
    await utils.task.list.cancel();
    // 2. Snapshot the previous value
    const previousTasks = utils.task.list.getData();
    // 3. Optimistically update the UI
    utils.task.list.setData({ workspaceId: "123" }, (old) => {
      return old.map((t) =>
        t.id === newTask.id ? { ...t, status: newTask.status } : t,
      );
    });
    // 4. Return context for rollback
    return { previousTasks };
  },
  onError(err, newTask, context) {
    // Rollback if the server fails
    utils.task.list.setData({ workspaceId: "123" }, context.previousTasks);
  },
});
```

## Consequences

- **Cache Management:** Developers need to understand when to "invalidate" queries (e.g., "If I create a task, I must tell the cache that the task-list is now stale").
- **Client-Side Only:** TanStack Query logic primarily lives in Client Components.
