# Knowledge Base: Deep Dive into `createTRPCOptionsProxy`

This document explains the mechanics of the `createTRPCOptionsProxy` function introduced in tRPC v11 and how it enables the "Prefetching & Hydration" pattern.

---

## 1. What is the "Options Proxy"?

The name breaks down into three technical concepts:

1.  **Proxy:** A JavaScript `Proxy` object that intercepts property access. When you write `trpc.users.get`, there isn't a physical `users` object; the Proxy intercepts the string "users" and dynamically routes your call.
2.  **Options:** Refers to the **TanStack Query Options** object. TanStack Query (the engine) doesn't know tRPC; it only knows how to execute a `queryKey` and a `queryFn`.
3.  **create...:** It is a factory function that builds this "Translator" between tRPC's structure and TanStack Query's requirements.

---

## 2. The Chain of Command

How does writing `trpc.hello.queryOptions()` actually work behind the scenes?

1. **The Factory Call (`trpc/server.ts`):**
   `export const trpc = createTRPCOptionsProxy({ ... });`
   This creates a "Factory" object that returns a special JavaScript Proxy.

2. **The Proxy Object:**
   The `trpc` constant is an "empty" object with a **Trap**. It intercepts any property access.

3. **The Trapping Action:**
   When you write `trpc.hello`, there is no `hello` property. The Proxy Trap catches this access and dynamically returns _another_ Proxy.

4. **The "Chain of Proxies":**
   This allows for deep nesting: `trpc` -> `trpc.workspace` -> `trpc.workspace.members`. Each level is a Proxy created on-the-fly.

5. **The Final Goal (`.queryOptions()`):**
   At the end of any "path," tRPC attaches helper methods like `.queryOptions()`. This is where the Proxy stops returning more proxies and instead returns the TanStack Query configuration object.

---

## 3. Universal Translation

The proxy is a "Universal Translator" that can operate in two modes depending on its configuration:

### Mode A: The "Direct Server" Proxy (Our `trpc/server.ts`)

- **Input:** It is given the **Server Router** and the **Context** (Session/Headers).
- **Behavior:** It calls backend functions **directly** as standard TypeScript functions.
- **Benefit:** Zero network overhead. It's as fast as a local function call.

### Mode B: The "Network Client" Proxy

- **Input:** It is given a **Network Client** (pointing to a URL like `/api/trpc`).
- **Behavior:** It intercepts calls and turns them into `fetch` requests over the network.
- **Benefit:** Provides a type-safe way to call the API from the browser or non-Next.js environments.

---

## 4. The `.queryOptions()` Method

The most important tool provided by the proxy is the `.queryOptions()` method. This method generates the "DNA" of a query:

```typescript
const options = trpc.user.list.queryOptions();

// Returns:
{
  queryKey: ['user', 'list'],
  queryFn: () => { /* Logic to call the procedure */ }
}
```

---

## 5. Why use Options on the Server? (Prefetching)

If Server Components can just `await` data, why involve TanStack Query options? The answer is **Hydration**.

### The Problem: The "Double Fetch"

1.  Server Component fetches `users`.
2.  Server sends HTML to the browser.
3.  Client Component "wakes up" and runs `useQuery`.
4.  Client Component **fetches `users` again** because its local cache is empty.

### The Solution: Prefetching & Hydration

Using `queryOptions` on the server allows us to:

1.  **Prefetch:** On the server, we fetch the data and "stuff it" into a server-side `QueryClient` cache.
2.  **Dehydrate:** We turn that cache into a JSON object and send it to the browser.
3.  **Hydrate:** The browser takes that JSON and fills its local `QueryClient` cache.
4.  **Instant Render:** When `useQuery` runs in the browser, it finds the data already in the cache and **shows it immediately** without a loading spinner.

---

## Summary

`createTRPCOptionsProxy` is the bridge that allows tRPC to "speak" TanStack Query. It allows us to share the same query keys and logic between the server and the client, ensuring that data fetched during the initial page load is instantly available to interactive client components.
