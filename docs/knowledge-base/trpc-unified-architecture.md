# Knowledge Base: Unified tRPC Architecture

This document explains the fully consolidated architecture of our tRPC v11 and TanStack Query v5 integration in CollabSpace. All tRPC-related logic and configuration now live within a single `src/trpc/` directory.

---

## The Directory Structure

Everything related to tRPC is located in `apps/web/src/trpc/`:

```text
src/trpc/
├── api/             # Backend implementation (The "Kitchen")
│   ├── init.ts      # tRPC initialization, Context, and Middleware
│   └── root.ts      # Main App Router and sub-router composition
├── client.tsx       # Client-side hooks and Providers (The "Customer")
├── server.ts        # Server-side direct-call proxy (The "Express Lane")
└── shared.ts        # Shared configuration (The "Brain")
```

---

## 1. Backend Implementation (`src/trpc/api/`)

This is where you define your API logic.

### `init.ts`

- **Purpose:** Initializes the tRPC engine (`initTRPC`), defines the request context (`createTRPCContext`), and exports procedure helpers (`publicProcedure`, `protectedProcedure`).
- **Context:** Includes the user session, request headers, and `activeOrganizationId` (extracted from headers or session), using React `cache` to avoid duplicate session fetches per request.
- **Procedures:**
  - `publicProcedure`: No authentication required.
  - `protectedProcedure`: Requires a valid user session.
  - `workspaceMemberProcedure`: Requires the user to be a member of the organization (specified via input or context).
  - `workspaceOwnerProcedure`: Requires the user to be an owner or admin of the organization.

### `root.ts`

- **Purpose:** The entry point for the API schema. It merges all sub-routers and defines the `AppRouter` type used by the frontend.

---

## 2. Shared Configuration (`src/trpc/shared.ts`)

- **`makeQueryClient`**: Centralizes the TanStack `QueryClient` configuration. It is used by both the client and the server to ensure consistent caching behavior.
- **Streaming SSR**: The `shouldDehydrateQuery` setting allows pending promises to be sent to the client, enabling Next.js streaming.

---

## 3. Usage Entry Points

### Client Components (`src/trpc/client.tsx`)

Exports `useTRPC` hooks and the `TRPCProvider`. It encapsulates all the setup needed for the browser, including the `QueryClient` singleton.

```tsx
"use client";
import { useTRPC } from "@/trpc/client";

export function MyComponent() {
  const trpc = useTRPC();
  const { data } = trpc.hello.useQuery({ text: "world" });
  return <div>{data?.greeting}</div>;
}
```

### Server Components (`src/trpc/server.ts`)

Exports the `trpc` direct-call proxy. It bypasses the network layer for maximum performance while maintaining identical type safety and authorization logic.

```tsx
import { trpc } from "@/trpc/server";

export default async function Page() {
  const data = await trpc.hello.query({ text: "server" });
  return <div>{data.greeting}</div>;
}
```

---

## 4. The Network Bridge

- **File:** `apps/web/src/app/api/trpc/[trpc]/route.ts`
- **Purpose:** Connects the client-side `httpBatchLink` to the server-side `appRouter`.

---

## Summary of Benefits

1. **Feature Grouping:** All tRPC code is in one place. No more jumping between `src/server/` and `src/trpc/`.
2. **Clear Naming:** `api/init.ts` clearly signals its purpose as the engine setup, while `client.tsx` and `server.ts` are obvious consumption points.
3. **Zero Redundancy:** Shared logic is truly shared via `shared.ts`.
