import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { LogoutButton } from "@/components/logout-button";
import { getAuthData } from "@/lib/auth-server";

export async function SiteHeader() {
  const { session, organizations, activeOrganizationId } = await getAuthData();

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
              <OrganizationSwitcher
                organizations={organizations}
                activeOrganizationId={activeOrganizationId}
              />
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
