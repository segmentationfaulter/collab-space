import { redirect, notFound } from "next/navigation";
import { getAuthData } from "@/lib/auth-server";
import { findOrganizationBySlug } from "@/utils/organization";
import { BoardsClient } from "./boards-client";
import { makeQueryClient } from "@/trpc/shared";
import { trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function BoardsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { session, organizations } = await getAuthData(orgSlug);

  if (!session) {
    redirect("/sign-in");
  }

  const activeOrg = findOrganizationBySlug(organizations, orgSlug);

  if (!activeOrg) {
    notFound();
  }

  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery(trpc.kanban.boards.list.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardsClient orgSlug={orgSlug} />;
    </HydrationBoundary>
  );
}
