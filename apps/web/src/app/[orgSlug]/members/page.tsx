import { getAuthData } from "@/lib/auth-server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { MembersClient } from "./members-client";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { session, organizations } = await getAuthData();

  if (!session) {
    redirect("/sign-in");
  }

  const activeOrg = organizations.find((org) => org.slug === orgSlug);

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

  const currentUserMember = members?.members.find(
    (m) => m.userId === session.user.id,
  );

  return (
    <MembersClient
      initialMembers={members?.members || []}
      initialInvitations={invitations}
      activeOrganizationId={activeOrg.id}
      currentUserId={session.user.id}
      currentUserRole={currentUserMember?.role || "member"}
    />
  );
}
