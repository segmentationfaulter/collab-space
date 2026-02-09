import Link from "next/link";
import { Building2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const requestHeaders = await headers();
  const [session, organizations] = await Promise.all([
    auth.api.getSession({ headers: requestHeaders }),
    auth.api.listOrganizations({ headers: requestHeaders }),
  ]);

  if (organizations && organizations.length > 0) {
    const firstOrg = organizations[0];
    await auth.api.setActiveOrganization({
      body: {
        organizationId: firstOrg.id,
        organizationSlug: firstOrg.slug,
      },
      headers: requestHeaders,
    });
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <span>CollabSpace</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          {session ? (
            <>
              <Suspense fallback={<Skeleton className="h-10 w-40" />}>
                <OrganizationSwitcher organizations={organizations} />
              </Suspense>
              <LogoutButton />
            </>
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
  );
}
