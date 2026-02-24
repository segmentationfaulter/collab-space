import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
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
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Workspace Member procedure
 *
 * Ensures the user is a member of the specified organization.
 * If no organizationId is provided in the input, it falls back to the activeOrganizationId in context.
 */
export const workspaceMemberProcedure = protectedProcedure
  .input(z.object({ organizationId: z.string().optional() }))
  .use(async ({ ctx, input, next }) => {
    const organizationId = input.organizationId ?? ctx.activeOrganizationId;

    if (!organizationId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Organization ID is required",
      });
    }

    // Check if the user is a member of the organization
    // We can check this locally from the organizations list in context
    const isMember = ctx.organizations.some((org) => org.id === organizationId);

    if (!isMember) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this organization",
      });
    }

    // Get the user's role in this organization
    let role = ctx.userRole;

    // If the organizationId is NOT the active one, we need to fetch the role for this specific org
    if (organizationId !== ctx.activeOrganizationId) {
      const res = await auth.api.listMembers({
        query: { organizationId },
        headers: ctx.headers,
      });
      const member = res?.members.find((m) => m.userId === ctx.session.user.id);
      role = (member?.role as typeof ctx.userRole) || null;
    }

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
  });

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
