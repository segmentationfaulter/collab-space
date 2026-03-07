import {
  defaultShouldDehydrateQuery,
  QueryClient,
  isServer,
} from "@tanstack/react-query";
import { TRPCError } from "@trpc/server";

export function getBaseUrl() {
  if (!isServer) return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

/**
 * Standardized tRPC Error Helpers
 */
export const TRPC_ERRORS = {
  UNAUTHORIZED: () =>
    new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action.",
    }),
  FORBIDDEN: (message = "You do not have permission to perform this action.") =>
    new TRPCError({
      code: "FORBIDDEN",
      message,
    }),
  NOT_FOUND: (resource = "Resource") =>
    new TRPCError({
      code: "NOT_FOUND",
      message: `${resource} not found or you don't have permission to access it.`,
    }),
  BAD_REQUEST: (message: string) =>
    new TRPCError({
      code: "BAD_REQUEST",
      message,
    }),
  CONFLICT: (message: string) =>
    new TRPCError({
      code: "CONFLICT",
      message,
    }),
  INTERNAL_SERVER_ERROR: () =>
    new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please try again later.",
    }),
};
