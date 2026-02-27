"use client";

import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useState, Suspense } from "react";
import { Plus, MoreHorizontal, Calendar } from "lucide-react";
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
  const [priority, setPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");

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
        setPriority("medium");
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
      priority,
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

            <div className="grid grid-cols-2 gap-6">
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

              <Field>
                <FieldLabel>Priority</FieldLabel>
                <FieldContent>
                  <Select
                    value={priority}
                    onValueChange={(v) =>
                      setPriority(v as "low" | "medium" | "high" | "urgent")
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </div>
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
  const { data: board } = useSuspenseQuery(
    trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
  );

  return (
    <div className="flex gap-6 h-full items-start">
      {board.columns.map((column) => (
        <BoardColumn key={column.id} column={column} />
      ))}
    </div>
  );
}

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

function BoardColumn({ column }: { column: Column }) {
  return (
    <div className="w-80 shrink-0 flex flex-col max-h-full group/column">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
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

      <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const priorityColor = {
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
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
              className="px-1.5 py-0 text-[10px] font-normal"
              style={{
                color: tl.label.color || undefined,
                borderColor: tl.label.color ? `${tl.label.color}40` : undefined,
                backgroundColor: tl.label.color
                  ? `${tl.label.color}10`
                  : undefined,
              }}
            >
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
              className={`px-1.5 py-0 text-[10px] font-medium uppercase ${priorityColor[task.priority as keyof typeof priorityColor]}`}
            >
              {task.priority}
            </Badge>
            {task.dueDate && (
              <div className="flex items-center text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
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
  );
}
