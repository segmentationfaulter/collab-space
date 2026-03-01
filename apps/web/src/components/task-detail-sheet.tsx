"use client";

import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDetailView } from "./task-detail-view";

export function TaskDetailSheet({
  taskId,
  boardSlug,
}: {
  taskId: string;
  boardSlug: string;
}) {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Sheet open onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="text-2xl font-bold">Task Details</SheetTitle>
        </SheetHeader>
        <div className="pt-6">
          <Suspense fallback={<TaskDetailSkeleton />}>
            <TaskDetailView taskId={taskId} boardSlug={boardSlug} />
          </Suspense>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TaskDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
