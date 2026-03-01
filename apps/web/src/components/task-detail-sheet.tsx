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
      <SheetContent className="sm:max-w-xl overflow-y-auto p-0 flex flex-col gap-0">
        <SheetHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between">
          <SheetTitle className="text-lg font-semibold">
            Task Details
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 px-6 py-8">
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
