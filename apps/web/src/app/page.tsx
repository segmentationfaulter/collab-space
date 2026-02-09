"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { Building2, Plus } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const { data: organizations, isPending: isOrgsPending } =
    authClient.useListOrganizations();
  const { data: activeOrg, isPending: isActivePending } =
    authClient.useActiveOrganization();
  const router = useRouter();

  useEffect(() => {
    if (
      session &&
      !isActivePending &&
      !activeOrg &&
      organizations &&
      organizations.length > 0
    ) {
      authClient.organization.setActive({
        organizationId: organizations[0].id,
      });
    }
  }, [session, activeOrg, organizations, isActivePending]);

  const isPending = isSessionPending || isOrgsPending || isActivePending;

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 md:px-6 gap-4">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span>CollabSpace</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            {session && <OrganizationSwitcher />}
            {session ? (
              <Button
                variant="ghost"
                className="cursor-pointer"
                size="sm"
                onClick={async () => {
                  await authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        router.refresh();
                      },
                    },
                  });
                }}
              >
                Logout
              </Button>
            ) : (
              <div className="flex gap-4">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="cursor-pointer">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        {session ? (
          activeOrg ? (
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
                  <p className="text-sm text-muted-foreground">
                    Coming soon...
                  </p>
                </div>
                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                  <h3 className="font-semibold mb-2">Team Members</h3>
                  <p className="text-sm text-muted-foreground">
                    Coming soon...
                  </p>
                </div>
                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
                  <h3 className="font-semibold mb-2">Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Coming soon...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md w-full space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Building2 className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Create your first workspace
                </h1>
                <p className="text-muted-foreground">
                  Workspaces are where you and your team can collaborate on
                  projects.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full gap-2 cursor-pointer"
                onClick={() => {
                  // This relies on the OrganizationSwitcher's dialog state
                  // or we can export a way to open it. For now, we'll suggest
                  // using the switcher.
                  const switcher = document.querySelector(
                    '[data-slot="dropdown-menu-trigger"]',
                  );
                  if (switcher instanceof HTMLElement) switcher.click();
                }}
              >
                <Plus className="h-5 w-5" />
                Get Started
              </Button>
            </div>
          )
        ) : (
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter">
              Collaborate without <span className="text-primary">limits.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-150 mx-auto">
              A modern, end-to-end type-safe platform for teams to build
              together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="px-8 cursor-pointer">
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 cursor-pointer"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
