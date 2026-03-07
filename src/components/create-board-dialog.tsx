"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import slugify from "slug";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useTRPC } from "@/trpc/client";

const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

type CreateBoardDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  orgSlug: string;
};

export function CreateBoardDialog({
  isOpen,
  onOpenChange,
  orgSlug,
}: CreateBoardDialogProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});

  const resetForm = () => {
    setName("");
    setSlug("");
    setIsAutoSlug(true);
    setErrors({});
  };

  const createBoard = useMutation(
    trpc.kanban.boards.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Board created successfully");
        queryClient.invalidateQueries(trpc.kanban.boards.list.queryOptions());
        onOpenChange(false);
        resetForm();
        router.push(`/${orgSlug}/boards/${data.slug}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create board");
      },
    }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = createBoardSchema.safeParse({ name, slug });

    if (!result.success) {
      const fieldErrors: { name?: string; slug?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === "name") fieldErrors.name = err.message;
        if (err.path[0] === "slug") fieldErrors.slug = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    createBoard.mutate(result.data);
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (isAutoSlug) {
      setSlug(slugify(newName, { lower: true }));
    }
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    setIsAutoSlug(false);
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
          <DialogDescription>
            Boards are where you manage your tasks and columns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="board-name">Board Name</FieldLabel>
            <FieldContent>
              <Input
                id="board-name"
                placeholder="e.g. Marketing Campaign"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                autoFocus
              />
              <FieldError errors={[{ message: errors.name }]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="board-slug">Slug</FieldLabel>
            <FieldContent>
              <Input
                id="board-slug"
                placeholder="marketing-campaign"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
              <FieldError errors={[{ message: errors.slug }]} />
              <p className="text-[10px] text-muted-foreground mt-1">
                This will be used in the URL: /{orgSlug}/boards/{"{slug}"}
              </p>
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
            <Button type="submit" disabled={createBoard.isPending}>
              {createBoard.isPending ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
