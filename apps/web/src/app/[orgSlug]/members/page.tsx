import { Suspense } from "react";
import { requireOrgAuth } from "@/lib/auth-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MembersClient } from "./members-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
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
    <Suspense fallback={<MembersLoadingSkeleton />}>
      <MembersClient
        membersPromise={membersPromise}
        invitationsPromise={invitationsPromise}
        activeOrganizationId={activeOrg.id}
        currentUserId={session.user.id}
        currentUserRole={userRole || "member"}
      />
    </Suspense>
  );
}

function MembersLoadingSkeleton() {
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
