"use client";

import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useState } from "react";
import { CalendarIcon, User, Tag, AlertCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "./date-picker";

export function TaskDetailView({
  taskId,
  boardSlug,
}: {
  taskId: string;
  boardSlug: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: task } = useSuspenseQuery(
    trpc.kanban.tasks.get.queryOptions({ taskId }),
  );

  const { data: members } = useSuspenseQuery(trpc.members.list.queryOptions());

  const { data: allLabels } = useSuspenseQuery(
    trpc.kanban.labels.list.queryOptions(),
  );

  const updateTask = useMutation(
    trpc.kanban.tasks.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.kanban.tasks.get.queryOptions({ taskId }),
        );
        queryClient.invalidateQueries(
          trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
        );
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update task");
      },
    }),
  );

  const addLabel = useMutation(
    trpc.kanban.tasks.addLabel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.kanban.tasks.get.queryOptions({ taskId }),
        );
        queryClient.invalidateQueries(
          trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
        );
      },
    }),
  );

  const removeLabel = useMutation(
    trpc.kanban.tasks.removeLabel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.kanban.tasks.get.queryOptions({ taskId }),
        );
        queryClient.invalidateQueries(
          trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
        );
      },
    }),
  );

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const handleTitleBlur = () => {
    if (title !== task.title && title.trim()) {
      updateTask.mutate({ taskId, title });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (task.description || "")) {
      updateTask.mutate({ taskId, description });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
          Title
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-2xl font-bold border-input/50 focus-visible:border-input focus-visible:ring-1 hover:border-input px-3 h-auto py-2 transition-all bg-accent/5 shadow-none"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          placeholder="Add a more detailed description..."
          className="min-h-32 resize-none border-input/50 focus-visible:border-input focus-visible:ring-1 hover:border-input px-3 transition-all bg-accent/5 shadow-none"
        />
      </div>

      <Separator className="my-2" />

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-6">
        {/* Priority */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
            <AlertCircle className="h-3 w-3" />
            <span>Priority</span>
          </div>
          <Select
            value={task.priority || "medium"}
            onValueChange={(v) =>
              updateTask.mutate({
                taskId,
                priority: v as "low" | "medium" | "high" | "urgent",
              })
            }
          >
            <SelectTrigger className="w-full bg-accent/5 border-input/50 hover:border-input hover:bg-accent/10 transition-all shadow-none">
              <SelectValue placeholder="Set priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignee */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
            <User className="h-3 w-3" />
            <span>Assignee</span>
          </div>
          <Select
            value={task.assigneeId || "unassigned"}
            onValueChange={(v) =>
              updateTask.mutate({
                taskId,
                assigneeId: v === "unassigned" ? null : v,
              })
            }
          >
            <SelectTrigger className="w-full bg-accent/5 border-input/50 hover:border-input hover:bg-accent/10 transition-all shadow-none">
              <SelectValue placeholder="Select member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={member.image || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {member.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
            <CalendarIcon className="h-3 w-3" />
            <span>Due Date</span>
          </div>
          <DatePicker
            className="w-full bg-accent/5 border-input/50 hover:border-input hover:bg-accent/10 transition-all shadow-none"
            date={task.dueDate ? new Date(task.dueDate) : null}
            onSelect={(date) =>
              updateTask.mutate({ taskId, dueDate: date || null })
            }
          />
        </div>

        {/* Labels */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 px-1">
            <Tag className="h-3 w-3" />
            <span>Labels</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {task.taskLabels.map((tl) => (
              <Badge
                key={tl.label.id}
                variant="secondary"
                className="pl-2 pr-1 py-0.5 gap-1 text-[11px] font-normal"
                style={{
                  backgroundColor: tl.label.color
                    ? `${tl.label.color}15`
                    : undefined,
                  color: tl.label.color || undefined,
                  borderColor: tl.label.color
                    ? `${tl.label.color}30`
                    : undefined,
                }}
              >
                {tl.label.name}
                <button
                  onClick={() =>
                    removeLabel.mutate({ taskId, labelId: tl.label.id })
                  }
                  className="hover:bg-background/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[10px] bg-transparent border-dashed hover:border-solid hover:bg-accent/50 transition-all shadow-none"
                >
                  + Add Label
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="start">
                <div className="space-y-1">
                  {allLabels.map((label) => {
                    const isSelected = task.taskLabels.some(
                      (tl) => tl.labelId === label.id,
                    );
                    return (
                      <button
                        key={label.id}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                        onClick={() => {
                          if (isSelected) {
                            removeLabel.mutate({ taskId, labelId: label.id });
                          } else {
                            addLabel.mutate({ taskId, labelId: label.id });
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: label.color || "#ccc" }}
                          />
                          <span>{label.name}</span>
                        </div>
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                  {allLabels.length === 0 && (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                      No labels found.
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
