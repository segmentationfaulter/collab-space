"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { Building2 } from "lucide-react";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
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
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
        <h1 className="text-4xl font-bold">Welcome to Collab Space</h1>
        {session ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground">
              Logged in as{" "}
              <span className="font-medium text-foreground">
                {session.user.name}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            A modern collaboration platform for your team.
          </p>
        )}
      </main>
    </div>
  );
}
