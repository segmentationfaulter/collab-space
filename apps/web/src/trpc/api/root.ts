import { z } from "zod";
import { publicProcedure, createTRPCRouter } from "./init";
import { kanbanRouter } from "./routers/kanban";
import { membersRouter } from "./routers/members";

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
  members: membersRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
