import { z } from "zod";
import { createTRPCRouter, workspaceMemberProcedure } from "../init";
import { boards, columns, tasks, labels, taskLabels } from "@/db/schemas";
import { eq, desc, and, asc } from "drizzle-orm";
import { db } from "@/db";
import { TRPC_ERRORS } from "../../shared";

/**
 * Reusable middlewares for Kanban entities
 */

/**
 * Ensures the board exists and belongs to the active organization.
 * Injects the verified board into the context.
 */
const boardProcedure = workspaceMemberProcedure
  .input(z.object({ boardId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const board = await db.query.boards.findFirst({
      where: and(
        eq(boards.id, input.boardId),
        eq(boards.organizationId, ctx.organizationId),
      ),
    });

    if (!board) {
      throw TRPC_ERRORS.NOT_FOUND("Board");
    }

    return next({
      ctx: { ...ctx, board },
    });
  });

/**
 * Ensures the column exists and its board belongs to the active organization.
 * Injects the verified column (with board) into the context.
 */
const columnProcedure = workspaceMemberProcedure
  .input(z.object({ columnId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const column = await db.query.columns.findFirst({
      where: eq(columns.id, input.columnId),
      with: {
        board: true,
      },
    });

    if (!column || column.board.organizationId !== ctx.organizationId) {
      throw TRPC_ERRORS.NOT_FOUND("Column");
    }

    return next({
      ctx: { ...ctx, column },
    });
  });

/**
 * Ensures the task exists and its column/board belong to the active organization.
 * Injects the verified task (with column and board hierarchy) into the context.
 */
const taskProcedure = workspaceMemberProcedure
  .input(z.object({ taskId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, input.taskId),
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

    return next({
      ctx: { ...ctx, task },
    });
  });

/**
 * Ensures the label exists and belongs to the active organization.
 * Injects the verified label into the context.
 */
const labelProcedure = workspaceMemberProcedure
  .input(z.object({ labelId: z.string() }))
  .use(async ({ ctx, input, next }) => {
    const label = await db.query.labels.findFirst({
      where: and(
        eq(labels.id, input.labelId),
        eq(labels.organizationId, ctx.organizationId),
      ),
    });

    if (!label) {
      throw TRPC_ERRORS.NOT_FOUND("Label");
    }

    return next({
      ctx: { ...ctx, label },
    });
  });

/**
 * Boards Sub-router
 */
const boardsRouter = createTRPCRouter({
  list: workspaceMemberProcedure.query(async ({ ctx }) => {
    return await db.query.boards.findMany({
      where: eq(boards.organizationId, ctx.organizationId),
      orderBy: [desc(boards.createdAt)],
    });
  }),

  create: workspaceMemberProcedure
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

  update: boardProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedBoard] = await db
        .update(boards)
        .set(input)
        .where(eq(boards.id, ctx.board.id))
        .returning();

      return updatedBoard;
    }),

  delete: boardProcedure.mutation(async ({ ctx }) => {
    const [deletedBoard] = await db
      .delete(boards)
      .where(eq(boards.id, ctx.board.id))
      .returning();

    return deletedBoard;
  }),

  getBySlug: workspaceMemberProcedure
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
});

/**
 * Columns Sub-router
 */
const columnsRouter = createTRPCRouter({
  create: boardProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newColumn] = await db
        .insert(columns)
        .values({
          id: input.id,
          name: input.name,
          boardId: ctx.board.id,
          position: input.position,
        })
        .returning();

      return newColumn;
    }),

  update: columnProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedColumn] = await db
        .update(columns)
        .set(input)
        .where(eq(columns.id, ctx.column.id))
        .returning();

      return updatedColumn;
    }),

  delete: columnProcedure.mutation(async ({ ctx }) => {
    const [deletedColumn] = await db
      .delete(columns)
      .where(eq(columns.id, ctx.column.id))
      .returning();

    return deletedColumn;
  }),

  reorder: boardProcedure
    .input(
      z.object({
        columnIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        const updates = input.columnIds.map((id, index) =>
          tx
            .update(columns)
            .set({ position: index + 1 })
            .where(and(eq(columns.id, id), eq(columns.boardId, ctx.board.id))),
        );

        await Promise.all(updates);

        return { success: true };
      });
    }),
});

/**
 * Tasks Sub-router
 */
const tasksRouter = createTRPCRouter({
  get: taskProcedure.query(async ({ ctx }) => {
    // We already have the task with column and board in context from taskProcedure
    // But we might want more relations like labels and assignee
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, ctx.task.id),
      with: {
        taskLabels: {
          with: {
            label: true,
          },
        },
        assignee: true,
      },
    });

    if (!task) {
      throw TRPC_ERRORS.NOT_FOUND("Task");
    }

    return task;
  }),

  create: columnProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newTask] = await db
        .insert(tasks)
        .values({
          id: input.id,
          title: input.title,
          columnId: ctx.column.id,
          description: input.description,
          priority: input.priority,
          position: input.position,
        })
        .returning();

      return newTask;
    }),

  update: taskProcedure
    .input(
      z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        columnId: z.string().optional(),
        assigneeId: z.string().nullable().optional(),
        dueDate: z.date().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedTask] = await db
        .update(tasks)
        .set(input)
        .where(eq(tasks.id, ctx.task.id))
        .returning();

      return updatedTask;
    }),

  delete: taskProcedure.mutation(async ({ ctx }) => {
    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, ctx.task.id))
      .returning();

    return deletedTask;
  }),

  reorder: boardProcedure
    .input(
      z.object({
        columnId: z.string(),
        taskIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify column belongs to this board
      const column = await db.query.columns.findFirst({
        where: and(
          eq(columns.id, input.columnId),
          eq(columns.boardId, ctx.board.id),
        ),
      });

      if (!column) {
        throw TRPC_ERRORS.NOT_FOUND("Column");
      }

      return await db.transaction(async (tx) => {
        const updates = input.taskIds.map((id, index) =>
          tx
            .update(tasks)
            .set({
              columnId: input.columnId,
              position: index + 1,
            })
            .where(eq(tasks.id, id)),
        );

        await Promise.all(updates);

        return { success: true };
      });
    }),

  addLabel: taskProcedure
    .input(z.object({ labelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify label belongs to organization
      const label = await db.query.labels.findFirst({
        where: and(
          eq(labels.id, input.labelId),
          eq(labels.organizationId, ctx.organizationId),
        ),
      });

      if (!label) {
        throw TRPC_ERRORS.NOT_FOUND("Label");
      }

      await db
        .insert(taskLabels)
        .values({
          taskId: ctx.task.id,
          labelId: input.labelId,
        })
        .onConflictDoNothing();

      return { success: true };
    }),

  removeLabel: taskProcedure
    .input(z.object({ labelId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(taskLabels)
        .where(
          and(
            eq(taskLabels.taskId, ctx.task.id),
            eq(taskLabels.labelId, input.labelId),
          ),
        );

      return { success: true };
    }),
});

/**
 * Labels Sub-router
 */
const labelsRouter = createTRPCRouter({
  list: workspaceMemberProcedure.query(async ({ ctx }) => {
    return await db.query.labels.findMany({
      where: eq(labels.organizationId, ctx.organizationId),
      orderBy: [asc(labels.name)],
    });
  }),

  create: workspaceMemberProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newLabel] = await db
        .insert(labels)
        .values({
          id: input.id,
          name: input.name,
          color: input.color,
          organizationId: ctx.organizationId,
        })
        .returning();

      return newLabel;
    }),

  update: labelProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedLabel] = await db
        .update(labels)
        .set(input)
        .where(eq(labels.id, ctx.label.id))
        .returning();

      return updatedLabel;
    }),

  delete: labelProcedure.mutation(async ({ ctx }) => {
    const [deletedLabel] = await db
      .delete(labels)
      .where(eq(labels.id, ctx.label.id))
      .returning();

    return deletedLabel;
  }),
});

/**
 * Main Kanban Router
 */
export const kanbanRouter = createTRPCRouter({
  boards: boardsRouter,
  columns: columnsRouter,
  tasks: tasksRouter,
  labels: labelsRouter,
});
