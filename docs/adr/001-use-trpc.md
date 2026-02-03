# ADR 001: Use tRPC for Internal API

## Status

Accepted

## Context

In modern full-stack development, the boundary between the client (Browser) and the server (API) is often a "fragile bridge." Traditional methods of bridging this gap—REST and GraphQL—introduce significant overhead and risk in a TypeScript-first environment.

### The Problem: The "Fragile Bridge"

1. **Manual Type Duplication:** In a typical REST setup, you define a `User` interface in your backend (e.g., in Go, Python, or even TS) and then manually recreate that same `User` interface in your frontend. If the backend changes a field name, the frontend breaks at runtime, not compile time.
2. **Schema Drift:** Documentation like Swagger/OpenAPI often lags behind the actual implementation. The "Source of Truth" is fragmented.
3. **Boilerplate Overload:** REST requires manual `fetch` calls, JSON parsing, error status checking, and manual state management for loading/error indicators.
4. **GraphQL Overhead:** While GraphQL solves some of these problems, it introduces heavy tooling (codegen, complex schemas, runtime libraries) that can be overkill for a unified monorepo.

## Decision

We will use **tRPC** (TypeScript Remote Procedure Call) as the exclusive communication layer for the internal application.

## Detailed Solution: End-to-End Type Safety

tRPC leverages TypeScript's `infer` and `ReturnType` capabilities to export the _types_ of your backend logic without exporting any actual implementation code. This creates a "Zero-API" feel.

### 1. Unified Validation & Logic

Input validation is handled by **Zod**. The schema used for validation is the same schema that provides the TypeScript types for the frontend.

### 2. Code Examples

#### Server-Side: Defining a Procedure

```typescript
// server/routers/task.ts
import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();

export const taskRouter = t.router({
  create: t.procedure
    .input(
      z.object({
        title: z.string().min(3),
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // The 'input' variable is automatically typed as { title: string; workspaceId: string }
      return await db.insert(tasks).values(input).returning();
    }),
});

export type AppRouter = typeof taskRouter;
```

#### Client-Side: Consuming the Procedure

```typescript
// client/components/TaskForm.tsx
import { trpc } from '@/utils/trpc';

export function TaskForm() {
  const mutation = trpc.task.create.useMutation();

  const onSubmit = (data) => {
    // TypeScript will error here if 'title' is missing or not a string
    mutation.mutate({
      title: "New Task",
      workspaceId: "ws_123"
    });
  };

  return (
    <div>
      {mutation.isLoading && <p>Saving...</p>}
      {mutation.error && <p>Error: {mutation.error.message}</p>}
      {/* ... */}
    </div>
  );
}
```

## Comparison Table

| Feature               | REST             | GraphQL             | tRPC                    |
| :-------------------- | :--------------- | :------------------ | :---------------------- |
| **Type Safety**       | Manual / Codegen | Codegen (Heavy)     | **Native / Automatic**  |
| **Source of Truth**   | OpenAPI/Docs     | Schema File         | **TypeScript Code**     |
| **DX (Autocomplete)** | Weak             | Good (with plugins) | **Perfect (Native TS)** |
| **Setup Cost**        | Low              | High                | **Low**                 |
| **Runtime Overhead**  | Low              | High                | **Low**                 |

## Consequences

- **TypeScript Requirement:** All participants in the internal API must use TypeScript.
- **Inference Limits:** Very large routers can occasionally slow down the TS compiler; we will mitigate this by using "Sub-routers" to modularize logic.
- **Direct Coupling:** The frontend "knows" the backend structure. This is a benefit for velocity but means breaking changes in the backend require immediate frontend updates (which TS will enforce).
