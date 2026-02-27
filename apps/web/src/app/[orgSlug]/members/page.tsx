import { requireOrgAuth } from "@/lib/auth-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MembersClient } from "./members-client";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { session, activeOrg, userRole } = await requireOrgAuth(orgSlug);

  const requestHeaders = await headers();

  const members = await auth.api.listMembers({
    query: {
      organizationId: activeOrg.id,
    },
    headers: requestHeaders,
  });

  const invitations = (
    await auth.api.listInvitations({
      query: {
        organizationId: activeOrg.id,
      },
      headers: requestHeaders,
    })
  ).filter((inv) => inv.status === "pending");

  return (
    <MembersClient
      initialMembers={members?.members || []}
      initialInvitations={invitations}
      activeOrganizationId={activeOrg.id}
      currentUserId={session.user.id}
      currentUserRole={userRole || "member"}
    />
  );
}
