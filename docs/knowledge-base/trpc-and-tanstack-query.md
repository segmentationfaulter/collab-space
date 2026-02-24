# Knowledge Base: tRPC & TanStack Query Integration

This document explains the architecture of our tRPC v11 setup and how it integrates with TanStack Query v5 to provide end-to-end type safety in CollabSpace.

---

## 1. The Core Concept: The "Type-Safe Tunnel"

tRPC creates a "Zero-API" feel. Instead of manually defining REST endpoints and then manually writing `fetch` calls with matching TypeScript interfaces, tRPC allows the Frontend to call Backend functions directly.

- **Autocomplete:** You get full Intellisense for inputs and outputs.
- **Runtime Validation:** All inputs are strictly validated by **Zod**.
- **State Management:** Loading, error, and caching states are handled automatically.

---

## 2. The Backend (The "Kitchen")

_Files: `apps/web/src/server/trpc.ts`, `root.ts`_

The backend defines the logic and the "Context" (the data available to every request).

### createTRPCContext

This function runs first for every request. It builds the **"Suitcase"** (Context) containing the user's `session` and request `headers`.

- **Why `cache`?** It uses React's `cache` to ensure that if multiple procedures in a single request need the session, we only fetch it from the database once.

### initTRPC

Initializes the tRPC engine and connects it to our "Suitcase" definition.

### Procedures (Helpers)

- **`publicProcedure`:** A base function anyone can call.
- **`protectedProcedure`:** Includes a middleware "Gatekeeper." It checks the "Suitcase" for a valid session; if missing, it throws an `UNAUTHORIZED` error before your logic even runs.

---

## 3. The Bridge (The "Order Window")

_File: `apps/web/src/app/api/trpc/[trpc]/route.ts`_

This is the standard Next.js API handler that bridges the network gap.

- **`fetchRequestHandler`:** Listens at `/api/trpc`. When the browser calls `/api/trpc/hello`, this handler finds the `hello` function in our `appRouter`, fills the "Suitcase" via `createTRPCContext`, and returns the result.

---

## 4. The Client (The "Customer")

_Files: `apps/web/src/trpc/client.ts`, `components/providers.tsx`_

This is how the browser interacts with the backend.

- **`createTRPCContext` (Client):** Creates a React Context so you can use `useTRPC()` anywhere in the app.
- **`createTRPCClient`:** The "Messenger" that knows how to turn a hook call into a real network `fetch`.
- **`QueryClient`:** The **TanStack Query Engine**. It manages the cache, retries, and "loading" states.
- **`TRPCProvider`:** Clicks the Messenger and the Engine together. It tells tRPC to store all results in the TanStack Query cache.

---

## 5. The Server Proxy (The "Express Lane")

_File: `apps/web/src/trpc/server.ts`_

In Next.js, we often need to call our API while already on the server (inside a **Server Component**).

- **`createTRPCOptionsProxy`:** Creates a "Direct Caller." Instead of making a network request to itself, it calls the backend function directly as a standard TypeScript function. It still uses `createTRPCContext`, so session and auth logic remain identical.

---

## 6. How to Use

### In a Client Component

Use the hooks for interactive features, loading states, and optimistic updates.

```tsx
"use client";
import { useTRPC } from "@/trpc/client";

export function Greeting() {
  const trpc = useTRPC();
  const { data, isLoading } = trpc.hello.useQuery({ text: "World" });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data.greeting}</div>;
}
```

### In a Server Component

Use the server proxy for fast, initial data fetching without sending JavaScript to the client.

```tsx
import { trpc } from "@/trpc/server";

export default async function Page() {
  // Direct server-to-server call
  const data = await trpc.hello.query({ text: "Server" });
  return <div>{data.greeting}</div>;
}
```

---

## Summary of Integration Benefits

1. **Unified Auth:** The same `createTRPCContext` logic handles sessions for both Client and Server calls.
2. **Single Source of Truth:** If you change a field name in `server/root.ts`, TypeScript will immediately show an error in every component using that data.
3. **Optimized Performance:** Server Components use the "Express Lane" (direct calls), while Client Components use the "Order Window" (network calls), both using the same shared logic.
