import { getAuthData } from "@/lib/auth-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MembersClient } from "./members-client";

export default async function MembersPage() {
  const { session, activeOrganizationId } = await getAuthData();

  if (!session) {
    redirect("/sign-in");
  }

  if (!activeOrganizationId) {
    redirect("/");
  }

  const requestHeaders = await headers();

  const members = await auth.api.listMembers({
    query: {
      organizationId: activeOrganizationId,
    },
    headers: requestHeaders,
  });

  const invitations = await auth.api.listInvitations({
    query: {
      organizationId: activeOrganizationId,
    },
    headers: requestHeaders,
  });

  return (
    <MembersClient
      initialMembers={members?.members || []}
      initialInvitations={invitations || []}
      activeOrganizationId={activeOrganizationId}
      currentUserId={session.user.id}
    />
  );
}
