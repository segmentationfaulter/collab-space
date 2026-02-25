import { createTRPCRouter, workspaceMemberProcedure } from "../init";
import { boards } from "@/db/schemas";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";

export const kanbanRouter = createTRPCRouter({
  getBoards: workspaceMemberProcedure.query(async ({ ctx }) => {
    return await db.query.boards.findMany({
      where: eq(boards.organizationId, ctx.organizationId),
      orderBy: [desc(boards.createdAt)],
    });
  }),
});
