import { Suspense } from "react";
import { requireOrgAuth } from "@/lib/auth-server";
import { makeQueryClient } from "@/trpc/shared";
import { trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { BoardClient } from "./board-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ orgSlug: string; boardSlug: string }>;
}) {
  const { orgSlug, boardSlug } = await params;
  await requireOrgAuth(orgSlug);

  const queryClient = makeQueryClient();
  // Prefetch board, columns, and tasks
  void queryClient.prefetchQuery(
    trpc.kanban.boards.getBySlug.queryOptions({ slug: boardSlug }),
  );

  return (
    <Suspense fallback={<BoardLoadingSkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BoardClient orgSlug={orgSlug} boardSlug={boardSlug} />
      </HydrationBoundary>
    </Suspense>
  );
}

function BoardLoadingSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-8 border-b">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-9 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto p-8 bg-accent/5">
        <div className="flex gap-6 h-full">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-80 shrink-0 flex flex-col gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
