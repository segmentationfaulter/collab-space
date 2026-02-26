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
        id: z.string().optional(),
        name: z.string().min(1, "Name is required"),
        slug: z.string().min(1, "Slug is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const [newBoard] = await tx
          .insert(boards)
          .values({
            id: input.id,
            name: input.name,
            slug: input.slug,
            organizationId: ctx.organizationId,
          })
          .returning();

        // Create default columns
        const defaultColumns = [
          { name: "Todo", position: 1, boardId: newBoard.id },
          { name: "In Progress", position: 2, boardId: newBoard.id },
          { name: "Done", position: 3, boardId: newBoard.id },
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
        id: z.string().optional(),
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
          id: input.id,
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

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

  createTask: workspaceMemberProcedure
    .input(
      z.object({
        id: z.string().optional(),
        columnId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify column belongs to organization via board
      const column = await db.query.columns.findFirst({
        where: eq(columns.id, input.columnId),
        with: {
          board: true,
        },
      });

      if (!column || column.board.organizationId !== ctx.organizationId) {
        throw TRPC_ERRORS.NOT_FOUND("Column");
      }

      const [newTask] = await db
        .insert(tasks)
        .values({
          id: input.id,
          title: input.title,
          columnId: input.columnId,
          description: input.description,
          priority: input.priority,
          position: input.position,
        })
        .returning();

      return newTask;
    }),

  updateTask: workspaceMemberProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        columnId: z.string().optional(),
        assigneeId: z.string().nullable().optional(),
        dueDate: z.date().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
        with: {
          column: {
            with: {
              board: true,
            },
          },
        },
      });

      if (!task || task.column.board.organizationId !== ctx.organizationId) {
        throw TRPC_ERRORS.NOT_FOUND("Task");
      }

      const [updatedTask] = await db
        .update(tasks)
        .set(data)
        .where(eq(tasks.id, id))
        .returning();

      return updatedTask;
    }),

  deleteTask: workspaceMemberProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, input.id),
        with: {
          column: {
            with: {
              board: true,
            },
          },
        },
      });

      if (!task || task.column.board.organizationId !== ctx.organizationId) {
        throw TRPC_ERRORS.NOT_FOUND("Task");
      }

      const [deletedTask] = await db
        .delete(tasks)
        .where(eq(tasks.id, input.id))
        .returning();

      return deletedTask;
    }),

  reorderColumns: workspaceMemberProcedure
    .input(
      z.object({
        boardId: z.string(),
        columnIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Verify board belongs to organization
      const board = await db.query.boards.findFirst({
        where: and(
          eq(boards.id, input.boardId),
          eq(boards.organizationId, ctx.organizationId),
        ),
      });

      if (!board) {
        throw TRPC_ERRORS.NOT_FOUND("Board");
      }

      // 2. Update positions in a transaction
      return await db.transaction(async (tx) => {
        const updates = input.columnIds.map((id, index) =>
          tx
            .update(columns)
            .set({ position: index + 1 })
            .where(and(eq(columns.id, id), eq(columns.boardId, input.boardId))),
        );

        await Promise.all(updates);

        return { success: true };
      });
    }),
});
