import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  integer,
  index,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth-schema";

export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const boards = pgTable(
  "boards",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // This unique index ensures that the 'slug' for a board is unique within the context
    // of its 'organizationId'. This prevents two boards in the same organization
    // from having the same slug, which is crucial for URL routing and data integrity.
    // While indexes primarily speed up queries, a unique index also enforces a
    // uniqueness constraint on the indexed columns.
    uniqueIndex("board_org_slug_idx").on(table.organizationId, table.slug),
  ],
);

export const columns = pgTable(
  "columns",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    boardId: text("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("column_board_name_idx").on(table.boardId, table.name),
    index("column_board_position_idx").on(table.boardId, table.position),
  ],
);

export const tasks = pgTable(
  "tasks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    columnId: text("column_id")
      .notNull()
      .references(() => columns.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    priority: priorityEnum("priority").default("medium").notNull(),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("task_column_position_idx").on(table.columnId, table.position),
    index("task_assigneeId_idx").on(table.assigneeId),
  ],
);

export const labels = pgTable(
  "labels",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    color: text("color"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("label_org_name_idx").on(table.organizationId, table.name),
  ],
);

export const taskLabels = pgTable(
  "task_labels",
  {
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.taskId, table.labelId] }),
    index("task_label_taskId_idx").on(table.taskId),
    index("task_label_labelId_idx").on(table.labelId),
  ],
);
