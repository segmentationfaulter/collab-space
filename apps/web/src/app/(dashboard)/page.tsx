"use client";

import { authClient, type Session } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Plus } from "lucide-react";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useCreateOrgDialog } from "@/hooks/use-create-org-dialog";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Home() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  if (isSessionPending) {
    return <Loading />;
  }

  if (!session) {
    return <LandingPage />;
  }

  return <AuthenticatedHome session={session} />;
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Spinner className="size-12 text-primary" />
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter">
          Collaborate without <span className="text-primary">limits.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-150 mx-auto">
          A modern, end-to-end type-safe platform for teams to build together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/sign-up">
            <Button size="lg" className="px-8 cursor-pointer">
              Get Started for Free
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="lg" className="px-8 cursor-pointer">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedHome({ session }: { session: Session }) {
  const { setOpen: setCreateDialogOpen } = useCreateOrgDialog();

  const { data: organizations, isPending: loadingOrganizations } =
    authClient.useListOrganizations();
  const { data: activeOrg, isPending: loadingActiveOrg } =
    authClient.useActiveOrganization();

  useEffect(() => {
    if (!loadingOrganizations && organizations && organizations.length > 0) {
      if (!loadingActiveOrg && !activeOrg) {
        authClient.organization.setActive({
          organizationId: organizations[0].id,
        });
      }
    }
  }, [organizations, loadingOrganizations, loadingActiveOrg, activeOrg]);

  const isPending =
    loadingOrganizations ||
    loadingActiveOrg ||
    (organizations && organizations.length > 0 && !activeOrg);

  if (isPending) {
    return <Loading />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
      {activeOrg ? (
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
              <h3 className="font-semibold mb-2">Projects</h3>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
              <h3 className="font-semibold mb-2">Team Members</h3>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
            <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
              <h3 className="font-semibold mb-2">Settings</h3>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>Create your first workspace</EmptyTitle>
            <EmptyDescription>
              Workspaces are where you and your team can collaborate on
              projects.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              size="lg"
              className="gap-2 cursor-pointer"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Get Started
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
