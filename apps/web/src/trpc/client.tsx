"use client";

import { createTRPCContext } from "@trpc/tanstack-react-query";
import { httpBatchLink, createTRPCClient } from "@trpc/client";
import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import React, { useState } from "react";

import type { AppRouter } from "./api/root";
import { makeQueryClient, getBaseUrl } from "./shared";

// Create the tRPC context for client-side hooks
export const { TRPCProvider: TRPCQueryProvider, useTRPC } =
  createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Combined Provider for tRPC and TanStack Query.
 * This simplifies the main providers.tsx by encapsulating all
 * tRPC/Query engine logic here.
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    }),
  );

  return (
    <TRPCQueryProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TRPCQueryProvider>
  );
}
