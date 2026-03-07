import { RouterOutputs } from "@/trpc/client";

/**
 * Base Board type (e.g. for lists, search results, or sidebars)
 */
export type Board = RouterOutputs["kanban"]["boards"]["list"][number];

/**
 * Full Board structure including nested columns and tasks
 * (e.g. for the main Kanban board view)
 */
export type BoardWithDetails = RouterOutputs["kanban"]["boards"]["getBySlug"];

/**
 * Nested types extracted from the full board structure
 */
export type Column = BoardWithDetails["columns"][number];
export type Task = Column["tasks"][number];
