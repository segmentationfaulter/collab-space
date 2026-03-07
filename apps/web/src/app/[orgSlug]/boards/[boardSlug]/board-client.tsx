"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useState, Suspense } from "react";
import {
  Plus,
  MoreHorizontal,
  AlertCircle,
  Clock,
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { Column, Task } from "@/types/kanban";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { createPortal } from "react-dom";
import { useEffect } from "react";

export function BoardHeader({ boardSlug }: { boardSlug: string }) {
  const trpc = useTRPC();
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // Use non-suspense query to get board data for the shell/actions
  // This enables the "Disabled Strategy"
  const { data: board } = useQuery(
    trpc.kanban.boards.getBySlug.queryOptions({
      slug: boardSlug,
    }),
  );

  return (
    <div className="p-8 border-b bg-background shrink-0">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Suspense fallback={<Skeleton className="h-9 w-64" />}>
            <BoardTitle boardSlug={boardSlug} />
          </Suspense>
          <p className="text-sm text-muted-foreground">
            Manage your project tasks and workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateColumnOpen(true)}
            disabled={!board}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateTaskOpen(true)}
            disabled={!board || board.columns.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button variant="ghost" size="icon" disabled={!board}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {board && (
        <>
          <CreateColumnDialog
            isOpen={isCreateColumnOpen}
            onOpenChange={setIsCreateColumnOpen}
            boardId={board.id}
            nextPosition={board.columns.length + 1}
            boardSlug={boardSlug}
          />
          <CreateTaskDialog
            isOpen={isCreateTaskOpen}
            onOpenChange={setIsCreateTaskOpen}
            columns={board.columns}
            boardSlug={boardSlug}
          />
        </>
      )}
    </div>
  );
}

import { Textarea } from "@/components/ui/textarea";
import { FieldGroup } from "@/components/ui/field";

function CreateTaskDialog({
  isOpen,
  onOpenChange,
  columns,
  boardSlug,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
  boardSlug: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(columns[0]?.id);

  const createTask = useMutation(
    trpc.kanban.tasks.create.mutationOptions({
      onSuccess: () => {
        toast.success("Task created");
        queryClient.invalidateQueries(
          trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
        );
        onOpenChange(false);
        setTitle("");
        setDescription("");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create task");
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;

    const column = columns.find((c) => c.id === columnId);
    const nextPosition = (column?.tasks.length ?? 0) + 1;

    createTask.mutate({
      title,
      description,
      columnId,
      position: nextPosition,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your board to start tracking progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="task-title">Title</FieldLabel>
              <FieldContent>
                <Input
                  id="task-title"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="task-description">Description</FieldLabel>
              <FieldContent>
                <Textarea
                  id="task-description"
                  placeholder="Add more details about this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>Column</FieldLabel>
              <FieldContent>
                <Select value={columnId} onValueChange={setColumnId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BoardTitle({ boardSlug }: { boardSlug: string }) {
  const trpc = useTRPC();
  const { data: board } = useSuspenseQuery(
    trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
  );
  return <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>;
}

export function BoardColumns({ boardSlug }: { boardSlug: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: board } = useSuspenseQuery(
    trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
  );

  const [columns, setColumns] = useState<Column[]>(board.columns);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sourceColumn, setSourceColumn] = useState<Column | null>(null);

  useEffect(() => {
    setColumns(board.columns);
  }, [board.columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const reorderColumns = useMutation(
    trpc.kanban.columns.reorder.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
        );
      },
      onError: (err) => {
        toast.error(err.message || "Failed to reorder columns");
        setColumns(board.columns);
      },
    }),
  );

  const reorderTasks = useMutation(
    trpc.kanban.tasks.reorder.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
        );
      },
      onError: (err) => {
        toast.error(err.message || "Failed to reorder tasks");
        setColumns(board.columns);
      },
    }),
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      const task = event.active.data.current.task as Task;
      setActiveTask(task);
      const col = columns.find((c) => c.tasks.some((t) => t.id === task.id));
      if (col) setSourceColumn(col);
      return;
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setColumns((columns) => {
        const activeColumn = columns.find((col) =>
          col.tasks.some((t) => t.id === activeId),
        );
        const overColumn = columns.find((col) =>
          col.tasks.some((t) => t.id === overId),
        );

        if (!activeColumn || !overColumn) return columns;

        if (activeColumn.id !== overColumn.id) {
          const activeTasks = [...activeColumn.tasks];
          const overTasks = [...overColumn.tasks];

          const activeTaskIndex = activeTasks.findIndex(
            (t) => t.id === activeId,
          );
          const overTaskIndex = overTasks.findIndex((t) => t.id === overId);

          const [movedTask] = activeTasks.splice(activeTaskIndex, 1);
          overTasks.splice(overTaskIndex, 0, {
            ...movedTask,
            columnId: overColumn.id,
          });

          return columns.map((col) => {
            if (col.id === activeColumn.id)
              return { ...col, tasks: activeTasks };
            if (col.id === overColumn.id) return { ...col, tasks: overTasks };
            return col;
          });
        }

        return columns;
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a Column
    if (isActiveATask && isOverAColumn) {
      setColumns((columns) => {
        const activeColumn = columns.find((col) =>
          col.tasks.some((t) => t.id === activeId),
        );
        const overColumn = columns.find((col) => col.id === overId);

        if (!activeColumn || !overColumn) return columns;

        if (activeColumn.id !== overColumn.id) {
          const activeTasks = [...activeColumn.tasks];
          const overTasks = [...overColumn.tasks];

          const activeTaskIndex = activeTasks.findIndex(
            (t) => t.id === activeId,
          );
          const [movedTask] = activeTasks.splice(activeTaskIndex, 1);
          overTasks.push({ ...movedTask, columnId: overColumn.id });

          return columns.map((col) => {
            if (col.id === activeColumn.id)
              return { ...col, tasks: activeTasks };
            if (col.id === overColumn.id) return { ...col, tasks: overTasks };
            return col;
          });
        }

        return columns;
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);
    const prevSourceColumn = sourceColumn;
    setSourceColumn(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (active.data.current?.type === "Column") {
      if (activeId !== overId) {
        const oldIndex = columns.findIndex((col) => col.id === activeId);
        const newIndex = columns.findIndex((col) => col.id === overId);

        const newColumns = arrayMove(columns, oldIndex, newIndex);
        setColumns(newColumns);
        reorderColumns.mutate({
          boardId: board.id,
          columnIds: newColumns.map((col) => col.id),
        });
      }
      return;
    }

    if (active.data.current?.type === "Task") {
      // Find where the task is NOW in our local state
      const currentActiveColumn = columns.find((col) =>
        col.tasks.some((t) => t.id === activeId),
      );

      if (!currentActiveColumn || !prevSourceColumn) return;

      const isInterColumnMove = prevSourceColumn.id !== currentActiveColumn.id;

      if (!isInterColumnMove) {
        // Intra-column move: just check if the position changed within the same column
        const oldIndex = prevSourceColumn.tasks.findIndex(
          (t) => t.id === activeId,
        );
        const newIndex = currentActiveColumn.tasks.findIndex(
          (t) => t.id === activeId,
        );

        if (oldIndex !== newIndex) {
          reorderTasks.mutate({
            boardId: board.id,
            columnId: currentActiveColumn.id,
            taskIds: currentActiveColumn.tasks.map((t) => t.id),
          });
        }
      } else {
        // Inter-column move: persisted via both columns
        // Both columns are updated in the UI by onDragOver, so we just persist both
        reorderTasks.mutate({
          boardId: board.id,
          columnId: currentActiveColumn.id,
          taskIds: currentActiveColumn.tasks.map((t) => t.id),
        });

        // Also update the source column to reflect the removal
        const finalSourceColumn = columns.find(
          (col) => col.id === prevSourceColumn.id,
        );
        if (finalSourceColumn) {
          reorderTasks.mutate({
            boardId: board.id,
            columnId: finalSourceColumn.id,
            taskIds: finalSourceColumn.tasks.map((t) => t.id),
          });
        }
      }
    }
  };

  return (
    <DndContext
      id="kanban-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 h-full items-start">
        <SortableContext
          items={columns.map((col) => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <SortableBoardColumn key={column.id} column={column} />
          ))}
        </SortableContext>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay
            modifiers={[restrictToWindowEdges]}
            dropAnimation={dropAnimation}
          >
            {activeColumn && (
              <div className="opacity-80 scale-105 transition-transform duration-200">
                <BoardColumn column={activeColumn} />
              </div>
            )}
            {activeTask && (
              <div className="opacity-80 scale-105 transition-transform duration-200 w-80">
                <TaskCard task={activeTask} />
              </div>
            )}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

function CreateColumnDialog({
  isOpen,
  onOpenChange,
  boardId,
  nextPosition,
  boardSlug,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  nextPosition: number;
  boardSlug: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();

  const createColumn = useMutation(
    trpc.kanban.columns.create.mutationOptions({
      onSuccess: () => {
        toast.success("Column created successfully");
        queryClient.invalidateQueries(
          trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
        );
        onOpenChange(false);
        setName("");
        setError(undefined);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create column");
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Column name is required");
      return;
    }
    createColumn.mutate({
      name,
      boardId,
      position: nextPosition,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setName("");
          setError(undefined);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
          <DialogDescription>
            Add a new column to organize your board&apos;s workflow.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="column-name">Column Name</FieldLabel>
            <FieldContent>
              <Input
                id="column-name"
                placeholder="e.g. In Review"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(undefined);
                }}
                autoFocus
              />
              <FieldError errors={[{ message: error }]} />
            </FieldContent>
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createColumn.isPending}>
              {createColumn.isPending ? "Adding..." : "Add Column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SortableBoardColumn({ column }: { column: Column }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-80 shrink-0 h-125 bg-accent/50 border-2 border-dashed border-muted-foreground/20 rounded-xl"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style}>
      <BoardColumn
        column={column}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function BoardColumn({
  column,
  dragHandleProps,
}: {
  column: Column;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div className="w-80 shrink-0 flex flex-col max-h-full group/column">
      <div className="flex items-center justify-between mb-4 px-1">
        <div
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
          {...dragHandleProps}
        >
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            {column.name}
          </h2>
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            {column.tasks.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar min-h-2.5">
        <SortableContext
          items={column.tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-25 bg-accent/50 border-2 border-dashed border-muted-foreground/20 rounded-xl opacity-50"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const { orgSlug, boardSlug } = useParams() as {
    orgSlug: string;
    boardSlug: string;
  };

  const priorityConfig = {
    low: {
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: ArrowDown,
    },
    medium: {
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: Minus,
    },
    high: {
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      icon: ArrowUp,
    },
    urgent: {
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: AlertCircle,
    },
  };

  const priority = (task.priority as keyof typeof priorityConfig) || "medium";
  const { color: priorityColor, icon: PriorityIcon } = priorityConfig[priority];

  return (
    <Link href={`/${orgSlug}/boards/${boardSlug}/tasks/${task.id}`}>
      <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer active:cursor-grabbing group">
        <CardHeader className="p-3 pb-2 space-y-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
              {task.title}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-1">
            {task.taskLabels.map((tl) => (
              <Badge
                key={tl.label.id}
                variant="outline"
                className="px-2 py-0 text-[9px] font-normal rounded-full border-none"
                style={{
                  color: tl.label.color || undefined,
                  backgroundColor: tl.label.color
                    ? `${tl.label.color}15`
                    : undefined,
                }}
              >
                <div
                  className="mr-1.5 h-1 w-1 rounded-full shrink-0"
                  style={{ backgroundColor: tl.label.color || "#ccc" }}
                />
                {tl.label.name}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`px-1.5 py-0 text-[10px] font-semibold uppercase rounded-sm border ${priorityColor}`}
              >
                <PriorityIcon className="h-2.5 w-2.5 mr-1" />
                {priority}
              </Badge>
              {task.dueDate && (
                <div className="flex items-center text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(task.dueDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
            {task.assignee && (
              <Avatar className="h-5 w-5 border border-background shadow-sm">
                <AvatarImage
                  src={task.assignee.image ?? undefined}
                  alt={task.assignee.name ?? undefined}
                />
                <AvatarFallback className="text-[8px]">
                  {task.assignee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
