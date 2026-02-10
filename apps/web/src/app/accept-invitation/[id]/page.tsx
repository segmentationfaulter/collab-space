import { auth, Invitation } from "@/lib/auth";
import { getAuthData } from "@/lib/auth-server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AcceptInvitationClient } from "./accept-invitation-client";
import { APIError } from "better-auth";
import { db } from "@/db";

export default async function AcceptInvitationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const { session } = await getAuthData();

  if (!session) {
    redirect(`/sign-in?callbackUrl=/accept-invitation/${id}`);
  }

  const requestHeaders = await headers();
  let invitation: Invitation | null = null;
  let organizationName: string | undefined = undefined;
  let error: string | null = null;

  try {
    invitation = await auth.api.getInvitation({
      query: {
        id: id,
      },
      headers: requestHeaders,
    });
  } catch (err) {
    if (err instanceof APIError) {
      error = err.message;
    } else {
      error = "Failed to fetch invitation";
    }
  }

  if (invitation) {
    try {
      const org = await db.query.organization.findFirst({
        where: (organization, { eq }) =>
          eq(organization.id, invitation.organizationId),
        columns: {
          name: true,
        },
      });

      organizationName = org?.name;
    } catch (err) {
      console.error("Failed to fetch organization name:", err);
      // We don't necessarily want to block the whole page if just the name fetch fails,
      // the client component handles the fallback.
    }
  }

  if (error || !invitation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>
              {error || "Invitation not found or has expired."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <AcceptInvitationClient
        invitation={invitation}
        invitationId={id}
        organizationName={organizationName}
      />
    </div>
  );
}
