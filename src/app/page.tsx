import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { getAuthData } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function RootPage() {
  const { session, organizations, activeOrganizationId } = await getAuthData();

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <LandingPage />
      </div>
    );
  }

  // If user has an active organization, redirect to its dashboard
  if (activeOrganizationId) {
    const activeOrg = organizations.find(
      (org) => org.id === activeOrganizationId,
    );
    if (activeOrg) {
      redirect(`/${activeOrg.slug}`);
    }
  }

  // If user is logged in but has no organizations, show the create workspace UI
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
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
            <Button size="lg" className="gap-2 cursor-pointer" asChild>
              <Link href="?create=true">
                <Plus className="h-5 w-5" />
                Get Started
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
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
