import { Suspense } from "react";
import { requireOrgAuth } from "@/lib/auth-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MembersClient } from "./members-client";
import { Skeleton } from "@/components/ui/skeleton";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return (
    <Suspense fallback={<MembersLoadingSkeleton />}>
      <AuthenticatedMembersContainer orgSlug={orgSlug} />
    </Suspense>
  );
}

async function AuthenticatedMembersContainer({ orgSlug }: { orgSlug: string }) {
  const { session, activeOrg, userRole } = await requireOrgAuth(orgSlug);

  const requestHeaders = await headers();

  const membersPromise = auth.api
    .listMembers({
      query: {
        organizationId: activeOrg.id,
      },
      headers: requestHeaders,
    })
    .then((res) => res?.members || []);

  const invitationsPromise = auth.api
    .listInvitations({
      query: {
        organizationId: activeOrg.id,
      },
      headers: requestHeaders,
    })
    .then((res) => (res || []).filter((inv) => inv.status === "pending"));

  return (
    <MembersClient
      membersPromise={membersPromise}
      invitationsPromise={invitationsPromise}
      activeOrganizationId={activeOrg.id}
      currentUserId={session.user.id}
      currentUserRole={userRole || "member"}
    />
  );
}

function MembersLoadingSkeleton() {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
