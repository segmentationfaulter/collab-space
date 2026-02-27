import { Suspense } from "react";
import { requireOrgAuth } from "@/lib/auth-server";
import { BoardsClient } from "./boards-client";
import { makeQueryClient } from "@/trpc/shared";
import { trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateBoardButton } from "./create-board-button";

export default async function BoardsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  await requireOrgAuth(orgSlug);

  const queryClient = makeQueryClient();
  // Start prefetching but don't await. This allows streaming to start immediately.
  void queryClient.prefetchQuery(trpc.kanban.boards.list.queryOptions());

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between min-h-18">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boards</h1>
          <p className="text-muted-foreground">
            Manage your projects and tasks across different boards.
          </p>
        </div>
        <CreateBoardButton orgSlug={orgSlug} />
      </div>

      <Suspense fallback={<BoardsLoadingSkeleton />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <BoardsClient orgSlug={orgSlug} />
        </HydrationBoundary>
      </Suspense>
    </div>
  );
}

function BoardsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}
