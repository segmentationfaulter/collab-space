"use client";

import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useState, useMemo } from "react";
import {
  CalendarIcon,
  User,
  Tag,
  AlertCircle,
  X,
  Check,
  ChevronLeft,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
  "#f43f5e", // Rose
  "#71717a", // Zinc
];

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

  const createLabel = useMutation(
    trpc.kanban.labels.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.kanban.labels.list.queryOptions());
        toast.success("Label created");
      },
    }),
  );

  const updateLabel = useMutation(
    trpc.kanban.labels.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.kanban.labels.list.queryOptions());
        queryClient.invalidateQueries(
          trpc.kanban.tasks.get.queryOptions({ taskId }),
        );
        toast.success("Label updated");
      },
    }),
  );

  const deleteLabel = useMutation(
    trpc.kanban.labels.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.kanban.labels.list.queryOptions());
        queryClient.invalidateQueries(
          trpc.kanban.tasks.get.queryOptions({ taskId }),
        );
        toast.success("Label deleted");
      },
    }),
  );

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  // Label Management State
  const [labelSearch, setLabelSearch] = useState("");
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [labelView, setLabelView] = useState<"list" | "create" | "edit">(
    "list",
  );
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelNameInput, setLabelNameInput] = useState("");
  const [labelColorInput, setLabelColorInput] = useState(PRESET_COLORS[0]);

  const filteredLabels = useMemo(() => {
    return allLabels.filter((l) =>
      l.name.toLowerCase().includes(labelSearch.toLowerCase()),
    );
  }, [allLabels, labelSearch]);

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

  const resetLabelForm = () => {
    setLabelView("list");
    setEditingLabelId(null);
    setLabelNameInput("");
    setLabelColorInput(PRESET_COLORS[0]);
  };

  const handleCreateLabel = () => {
    if (!labelNameInput.trim()) return;
    createLabel.mutate(
      { name: labelNameInput, color: labelColorInput },
      {
        onSuccess: (newLabel) => {
          addLabel.mutate({ taskId, labelId: newLabel.id });
          resetLabelForm();
        },
      },
    );
  };

  const handleUpdateLabel = () => {
    if (!editingLabelId || !labelNameInput.trim()) return;
    updateLabel.mutate(
      { labelId: editingLabelId, name: labelNameInput, color: labelColorInput },
      { onSuccess: resetLabelForm },
    );
  };

  const handleDeleteLabel = (labelId: string) => {
    deleteLabel.mutate({ labelId }, { onSuccess: resetLabelForm });
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
            <Popover
              open={isLabelPopoverOpen}
              onOpenChange={(open) => {
                setIsLabelPopoverOpen(open);
                if (!open) resetLabelForm();
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-[10px] bg-transparent border-dashed hover:border-solid hover:bg-accent/50 transition-all shadow-none"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Label
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                {labelView === "list" ? (
                  <div className="flex flex-col">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Search or create label..."
                        value={labelSearch}
                        onChange={(e) => setLabelSearch(e.target.value)}
                        className="h-8 text-xs focus-visible:ring-1"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-50 overflow-y-auto p-1">
                      {filteredLabels.map((label) => {
                        const isSelected = task.taskLabels.some(
                          (tl) => tl.labelId === label.id,
                        );
                        return (
                          <div
                            key={label.id}
                            className="group flex items-center justify-between px-2 py-1.5 text-xs hover:bg-accent rounded-sm cursor-pointer"
                            onClick={() => {
                              if (isSelected) {
                                removeLabel.mutate({
                                  taskId,
                                  labelId: label.id,
                                });
                              } else {
                                addLabel.mutate({ taskId, labelId: label.id });
                              }
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                className="h-2 w-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor: label.color || "#ccc",
                                }}
                              />
                              <span className="truncate">{label.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingLabelId(label.id);
                                  setLabelNameInput(label.name);
                                  setLabelColorInput(
                                    label.color || PRESET_COLORS[0],
                                  );
                                  setLabelView("edit");
                                }}
                                className="p-1 hover:bg-background/20 rounded"
                              >
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </button>
                              {isSelected && <Check className="h-3.5 w-3.5" />}
                            </div>
                          </div>
                        );
                      })}

                      {filteredLabels.length === 0 && labelSearch && (
                        <button
                          className="w-full flex items-center gap-2 px-2 py-2 text-xs hover:bg-accent rounded-sm text-left"
                          onClick={() => {
                            setLabelNameInput(labelSearch);
                            setLabelView("create");
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          <span>
                            Create <strong>{`"${labelSearch}"`}</strong>
                          </span>
                        </button>
                      )}

                      {allLabels.length === 0 && !labelSearch && (
                        <div className="p-4 text-[11px] text-muted-foreground text-center">
                          No labels created yet.
                        </div>
                      )}
                    </div>
                    <div className="p-1 border-t mt-auto">
                      <button
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent rounded-sm text-left font-medium"
                        onClick={() => {
                          setLabelNameInput(labelSearch);
                          setLabelView("create");
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        <span>Create Label</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={resetLabelForm}
                        className="p-1 hover:bg-accent rounded"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-semibold">
                        {labelView === "create" ? "Create Label" : "Edit Label"}
                      </span>
                      {labelView === "edit" ? (
                        <button
                          onClick={() => handleDeleteLabel(editingLabelId!)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded group"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                        </button>
                      ) : (
                        <div className="w-6" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Input
                        placeholder="Label name"
                        value={labelNameInput}
                        onChange={(e) => setLabelNameInput(e.target.value)}
                        className="h-8 text-xs focus-visible:ring-1"
                        autoFocus
                      />

                      <div className="grid grid-cols-6 gap-1.5 pt-1">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            className={cn(
                              "h-6 w-6 rounded-full flex items-center justify-center transition-all hover:scale-110",
                              labelColorInput === color
                                ? "ring-2 ring-ring ring-offset-1"
                                : "",
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => setLabelColorInput(color)}
                          >
                            {labelColorInput === color && (
                              <Check className="h-3 w-3 text-white drop-shadow-sm" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full h-8 text-xs"
                      onClick={
                        labelView === "create"
                          ? handleCreateLabel
                          : handleUpdateLabel
                      }
                      disabled={
                        !labelNameInput.trim() ||
                        createLabel.isPending ||
                        updateLabel.isPending
                      }
                    >
                      {labelView === "create" ? "Create Label" : "Save Changes"}
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
