"use client";

import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useState } from "react";
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
import type { BoardWithDetails, Column, Task } from "@/types/kanban";

type BoardClientProps = {
  boardSlug: string;
};

export function BoardClient({ boardSlug }: BoardClientProps) {
  const trpc = useTRPC();
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false);

  const { data: board } = useSuspenseQuery(
    trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <BoardHeader
        board={board}
        onCreateColumn={() => setIsCreateColumnOpen(true)}
      />
      <div className="flex-1 overflow-x-auto p-8 bg-accent/5">
        <div className="flex gap-6 h-full items-start">
          {board.columns.map((column) => (
            <BoardColumn key={column.id} column={column} />
          ))}
        </div>
      </div>

      <CreateColumnDialog
        isOpen={isCreateColumnOpen}
        onOpenChange={setIsCreateColumnOpen}
        boardId={board.id}
        nextPosition={board.columns.length + 1}
        boardSlug={boardSlug}
      />
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

function BoardHeader({
  board,
  onCreateColumn,
}: {
  board: BoardWithDetails;
  onCreateColumn: () => void;
}) {
  return (
    <div className="p-8 border-b bg-background shrink-0">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
          <p className="text-sm text-muted-foreground">
            Manage your project tasks and workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCreateColumn}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
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
            <Plus className="h-4 w-4" />
          </Button>
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
