# Plan: 02-kanban (Boards, Columns & Tasks)

## Goals

- Implement the core Kanban data model (Boards, Columns, Tasks, Labels).
- Establish tRPC procedures for full CRUD on Kanban entities.
- Build a functional Kanban board with drag-and-drop capabilities.
- Implement optimistic updates for a snappy user experience.

## Tasks

### Task 1: Database Schema

- [x] Create `apps/web/src/db/schemas/kanban-schema.ts`.
- [x] Define `boards` table (linked to `organizationId`).
- [x] Define `columns` table (linked to `boardId`, includes `position`).
- [x] Define `tasks` table (linked to `columnId`, includes `position`, `assigneeId`, `priority`, etc.).
- [x] Update `apps/web/src/db/schemas/index.ts` to export the new schema.
- [x] Define `labels` table (id, name, color, linked to `organizationId`).
- [x] Define `task_labels` join table (taskId, labelId).
- [x] Update `apps/web/src/db/relations.ts` with new relations.
- **Verification:** Check database using a tool or Drizzle Studio to ensure tables are created with correct relations.

### Task 2: tRPC Procedures (CRUD)

- [x] Create `apps/web/src/trpc/api/routers/kanban.ts`.
- [x] Implement `getBoards` (protected, filtered by `organizationId`).
- [x] Implement `createBoard` (should create default columns: Todo, In Progress, Done).
- [x] Implement `updateBoard` and `deleteBoard`.
- [x] Implement `getBoardBySlug` (fetches board, columns, and tasks with labels).
- [x] Implement `createColumn`, `updateColumn` (without position), `deleteColumn`.
- [x] Implement `createTask`, `updateTask` (without position), `deleteTask`.
- [ ] Implement `reorderTasks` (handles moving tasks between columns and within a column).
- [x] Implement `reorderColumns` (handles moving columns within a board).
- [ ] Implement Label management procedures (`getLabels`, `createLabel`, `updateLabel`, `deleteLabel`).
- [ ] Implement Task-Label association procedures (`addLabelToTask`, `removeLabelFromTask`).
- [ ] Register `kanbanRouter` in `apps/web/src/trpc/api/root.ts`.
- **Verification:** Use a tRPC playground or a simple test page to verify all CRUD operations work as expected.

### Task 3: Board & Column UI

- [ ] Create a page for listing boards: `apps/web/src/app/[orgSlug]/boards/page.tsx`.
- [ ] Create a "Create Board" dialog.
- [ ] Create the main Kanban board view: `apps/web/src/app/[orgSlug]/boards/[boardSlug]/page.tsx`.
- [ ] Implement `BoardHeader` and `Column` components.
- [ ] Add ability to create new columns.
- **Verification:** User can create a board and see empty columns on the board page.

### Task 4: Task Management UI

- [ ] Create `TaskCard` component (with label support).
- [ ] Implement "Create Task" form within a column.
- [ ] Implement Task detail view (dialog or sheet) for editing description, priority, labels, etc.
- **Verification:** User can create tasks in columns and view/edit their details.

### Task 5: Drag-and-Drop Implementation

- [ ] Install `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities`.
- [ ] Wrap the board in `DndContext`.
- [ ] Implement `SortableContext` for columns and tasks.
- [ ] Handle `onDragEnd` to update local state and call `reorderTasks` tRPC procedure.
- [ ] Implement optimistic updates for task movements.
- **Verification:** Tasks can be dragged between and within columns, and their new positions persist after a refresh.

### Task 6: Optimistic Updates

- [ ] Implement TanStack Query `onMutate`, `onError`, and `onSettled` for task creation and editing.
- **Verification:** Task creation and editing feel instantaneous even with artificial network latency.
