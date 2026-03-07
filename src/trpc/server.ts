import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { appRouter } from "./api/root";
import { createTRPCContext } from "./api/init";
import { cache } from "react";
import { makeQueryClient } from "./shared";

const getQueryClient = cache(makeQueryClient);

/**
 * This wraps the `createTRPCOptionsProxy` helper from tRPC to provide
 * a type-safe way to call tRPC procedures from Server Components.
 *
 * It bypasses the network and calls procedures directly on the server.
 */
export const trpc = createTRPCOptionsProxy({
  router: appRouter,
  ctx: createTRPCContext,
  queryClient: getQueryClient,
});
