import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "./init";
import { kanbanRouter } from "./routers/kanban";

export const appRouter = createTRPCRouter({
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
  kanban: kanbanRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
