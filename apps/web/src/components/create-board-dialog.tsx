"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import slugify from "slug";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
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

type CreateBoardValues = z.infer<typeof createBoardSchema>;

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
  const [isAutoSlug, setIsAutoSlug] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBoardValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const nameValue = watch("name");

  // Sync name to slug if auto-slug is enabled
  useEffect(() => {
    if (isAutoSlug && nameValue) {
      setValue("slug", slugify(nameValue, { lower: true }));
    }
  }, [nameValue, isAutoSlug, setValue]);

  const createBoard = useMutation(
    trpc.kanban.boards.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Board created successfully");
        onOpenChange(false);
        reset();
        router.push(`/${orgSlug}/boards/${data.slug}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create board");
      },
    }),
  );

  const onSubmit = (values: CreateBoardValues) => {
    createBoard.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
          <DialogDescription>
            Boards are where you manage your tasks and columns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field>
            <FieldLabel>Board Name</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. Marketing Campaign"
                {...register("name")}
                autoFocus
              />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Slug</FieldLabel>
            <FieldContent>
              <Input
                placeholder="marketing-campaign"
                {...register("slug")}
                onChange={(e) => {
                  setIsAutoSlug(false);
                  register("slug").onChange(e);
                }}
              />
              <FieldError errors={[errors.slug]} />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
