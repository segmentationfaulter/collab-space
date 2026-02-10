"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Invitation } from "@/lib/auth";

interface AcceptInvitationClientProps {
  invitation: Invitation;
  invitationId: string;
  organizationName?: string;
}

export function AcceptInvitationClient({
  invitation,
  invitationId,
  organizationName,
}: AcceptInvitationClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleAccept = async () => {
    setIsPending(true);
    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        toast.error(error.message || "Failed to accept invitation");
      } else {
        toast.success("Invitation accepted successfully");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleReject = async () => {
    setIsPending(true);
    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      });

      if (error) {
        toast.error(error.message || "Failed to reject invitation");
      } else {
        toast.success("Invitation rejected");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Accept Invitation</CardTitle>
        <CardDescription>
          You have been invited to join{" "}
          <strong>{organizationName || "The organization"}</strong> as a{" "}
          <strong>{invitation.role}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {`Once you accept, you will have access to the organization's
          workspaces and projects.`}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleReject}
          disabled={isPending}
        >
          Reject
        </Button>
        <Button className="flex-1" onClick={handleAccept} disabled={isPending}>
          {isPending ? "Processing..." : "Accept"}
        </Button>
      </CardFooter>
    </Card>
  );
}
