import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { cache } from "react";
import { headers } from "next/headers";
import { getAuthData } from "@/lib/auth-server";
import "server-only";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
export const createTRPCContext = cache(async () => {
  const requestHeaders = await headers();
  const authData = await getAuthData();

  return {
    ...authData,
    headers: requestHeaders,
  };
});

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend error handling.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE HELPERS
 *
 * These are the "public" facing parts of the tRPC API. We use these to create
 * routers and procedures.
 */

/**
 * Create a reusable router helper that can be used throughout the router
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      // infers the `session` as non-nullable
      session: ctx.session,
    },
  });
});

/**
 * Workspace Member procedure
 *
 * Ensures the user is a member of the active organization.
 */
export const workspaceMemberProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const organizationId = ctx.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "No active organization found. Please select or create a workspace.",
      });
    }

    // Since it's the activeOrganizationId, we know the user is a member
    // because it was verified in getAuthData when the context was created.
    // We just need to ensure the role is available.
    const role = ctx.userRole;

    if (!role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Could not verify your role in this organization",
      });
    }

    return next({
      ctx: {
        ...ctx,
        organizationId,
        userRole: role,
      },
    });
  },
);

/**
 * Workspace Owner/Admin procedure
 *
 * Ensures the user is an owner or admin of the specified organization.
 */
export const workspaceOwnerProcedure = workspaceMemberProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.userRole !== "owner" && ctx.userRole !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action",
      });
    }
    return next({ ctx });
  },
);
