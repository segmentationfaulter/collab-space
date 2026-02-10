import { getAuthData } from "@/lib/auth-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { MembersClient } from "./members-client";
import { findOrganizationBySlug } from "@/utils/organization";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { session, organizations, userRole } = await getAuthData(orgSlug);

  if (!session) {
    redirect("/sign-in");
  }

  const activeOrg = findOrganizationBySlug(organizations, orgSlug);

  if (!activeOrg) {
    notFound();
  }

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
