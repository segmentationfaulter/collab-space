import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import "server-only";

/**
 * Initialization of tRPC backend
 * Should be done only once per app!
 */
const t = initTRPC.create({
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
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure
 *
 * For now, this is a placeholder. In Task 2, we will integrate Better Auth
 * and check the session here.
 */
export const protectedProcedure = t.procedure.use(async ({ next, ctx }) => {
  // Placeholder: In Task 2, we will add:
  // if (!ctx.session) { throw new TRPCError({ code: "UNAUTHORIZED" }); }
  return next({
    ctx: {
      // ctx will be expanded later
      ...ctx,
    },
  });
});
