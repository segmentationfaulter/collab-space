import { z } from "zod";
import { createTRPCRouter, workspaceMemberProcedure } from "../init";
import { boards, columns } from "@/db/schemas";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";

export const kanbanRouter = createTRPCRouter({
  getBoards: workspaceMemberProcedure.query(async ({ ctx }) => {
    return await db.query.boards.findMany({
      where: eq(boards.organizationId, ctx.organizationId),
      orderBy: [desc(boards.createdAt)],
    });
  }),

  createBoard: workspaceMemberProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        slug: z.string().min(1, "Slug is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const boardId = crypto.randomUUID();

      return await db.transaction(async (tx) => {
        const [newBoard] = await tx
          .insert(boards)
          .values({
            id: boardId,
            name: input.name,
            slug: input.slug,
            organizationId: ctx.organizationId,
          })
          .returning();

        // Create default columns
        const defaultColumns = [
          { id: crypto.randomUUID(), name: "Todo", position: 1, boardId },
          {
            id: crypto.randomUUID(),
            name: "In Progress",
            position: 2,
            boardId,
          },
          { id: crypto.randomUUID(), name: "Done", position: 3, boardId },
        ];

        await tx.insert(columns).values(defaultColumns);

        return newBoard;
      });
    }),
});
