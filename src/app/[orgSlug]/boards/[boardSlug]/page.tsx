import { Suspense } from "react";
import { requireOrgAuth } from "@/lib/auth-server";
import { makeQueryClient } from "@/trpc/shared";
import { trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { BoardHeader, BoardColumns } from "./board-client";
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
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BoardHeader boardSlug={boardSlug} />
        <div className="flex-1 overflow-x-auto p-8 bg-accent/5">
          <Suspense fallback={<BoardColumnsSkeleton />}>
            <BoardColumns key={boardSlug} boardSlug={boardSlug} />
          </Suspense>
        </div>
      </HydrationBoundary>
    </div>
  );
}

function BoardColumnsSkeleton() {
  return (
    <div className="flex gap-6 h-full items-start">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="w-80 shrink-0 flex flex-col gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
