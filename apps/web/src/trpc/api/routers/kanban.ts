import { z } from "zod";
import { createTRPCRouter, workspaceMemberProcedure } from "../init";
import { boards, columns, tasks } from "@/db/schemas";
import { eq, desc, and, asc } from "drizzle-orm";
import { db } from "@/db";
import { TRPC_ERRORS } from "../../shared";

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

  updateBoard: workspaceMemberProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updatedBoard] = await db
        .update(boards)
        .set(data)
        .where(
          and(eq(boards.id, id), eq(boards.organizationId, ctx.organizationId)),
        )
        .returning();

      if (!updatedBoard) {
        throw TRPC_ERRORS.NOT_FOUND("Board");
      }

      return updatedBoard;
    }),

  deleteBoard: workspaceMemberProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedBoard] = await db
        .delete(boards)
        .where(
          and(
            eq(boards.id, input.id),
            eq(boards.organizationId, ctx.organizationId),
          ),
        )
        .returning();

      if (!deletedBoard) {
        throw TRPC_ERRORS.NOT_FOUND("Board");
      }

      return deletedBoard;
    }),

  getBoardBySlug: workspaceMemberProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const board = await db.query.boards.findFirst({
        where: and(
          eq(boards.slug, input.slug),
          eq(boards.organizationId, ctx.organizationId),
        ),
        with: {
          columns: {
            orderBy: [asc(columns.position)],
            with: {
              tasks: {
                orderBy: [asc(tasks.position)],
                with: {
                  taskLabels: {
                    with: {
                      label: true,
                    },
                  },
                  assignee: true,
                },
              },
            },
          },
        },
      });

      if (!board) {
        throw TRPC_ERRORS.NOT_FOUND("Board");
      }

      return board;
    }),

  createColumn: workspaceMemberProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify board belongs to organization
      const board = await db.query.boards.findFirst({
        where: and(
          eq(boards.id, input.boardId),
          eq(boards.organizationId, ctx.organizationId),
        ),
      });

      if (!board) {
        throw TRPC_ERRORS.NOT_FOUND("Board");
      }

      const [newColumn] = await db
        .insert(columns)
        .values({
          id: crypto.randomUUID(),
          name: input.name,
          boardId: input.boardId,
          position: input.position,
        })
        .returning();

      return newColumn;
    }),

  updateColumn: workspaceMemberProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        position: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Update only if column's board belongs to organization
      // We join with boards to verify ownership in a single query
      const [updatedColumn] = await db
        .update(columns)
        .set(data)
        .where(
          and(
            eq(columns.id, id),
            eq(
              columns.boardId,
              db
                .select({ id: boards.id })
                .from(boards)
                .where(eq(boards.organizationId, ctx.organizationId)),
            ),
          ),
        )
        .returning();

      if (!updatedColumn) {
        throw TRPC_ERRORS.NOT_FOUND("Column");
      }

      return updatedColumn;
    }),

  deleteColumn: workspaceMemberProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete only if column's board belongs to organization
      const [deletedColumn] = await db
        .delete(columns)
        .where(
          and(
            eq(columns.id, input.id),
            eq(
              columns.boardId,
              db
                .select({ id: boards.id })
                .from(boards)
                .where(eq(boards.organizationId, ctx.organizationId)),
            ),
          ),
        )
        .returning();

      if (!deletedColumn) {
        throw TRPC_ERRORS.NOT_FOUND("Column");
      }

      return deletedColumn;
    }),
});
