import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAuthData } from "@/lib/auth-server";
import { Organization } from "@/lib/auth";
import { type Session } from "@/lib/auth-client";

export default async function WorkspacePage({
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

  return <AuthenticatedHome session={session} activeOrg={activeOrg} />;
}

function AuthenticatedHome({
  session,
  activeOrg,
}: {
  session: Session;
  activeOrg: Organization;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back to {activeOrg.name}
          </h1>
          <p className="text-xl text-muted-foreground">
            You are logged in as {session.user.name}.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold mb-2">Boards</h3>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </div>
          <Link
            href={`/${activeOrg.slug}/members`}
            className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm hover:bg-accent/50 transition-colors"
          >
            <h3 className="font-semibold mb-2">Team Members</h3>
            <p className="text-sm text-muted-foreground">
              Invite and manage your team.
            </p>
          </Link>
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold mb-2">Settings</h3>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
