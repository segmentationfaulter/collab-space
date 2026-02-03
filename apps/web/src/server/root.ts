import { z } from "zod";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;
