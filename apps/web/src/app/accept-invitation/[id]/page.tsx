import { auth, Invitation, Organization } from "@/lib/auth";
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
  let organization: Organization | null = null;
  let error: string | null = null;

  try {
    invitation = await auth.api.getInvitation({
      query: {
        id: id,
      },
      headers: requestHeaders,
    });

    organization = await auth.api.getFullOrganization({
      query: {
        organizationId: invitation.organizationId,
        membersLimit: 0,
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
        organizationName={organization?.name}
      />
    </div>
  );
}
