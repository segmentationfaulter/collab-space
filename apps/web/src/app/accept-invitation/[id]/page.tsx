"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
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
import { Spinner } from "@/components/ui/spinner";
import { Invitation } from "@/lib/auth";

export default function AcceptInvitationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const [invitation, setInvitation] = useState<Invitation>();
  const [isPending, setIsPending] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push(`/sign-in?callbackUrl=/accept-invitation/${id}`);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const { data, error } = await authClient.organization.getInvitation({
          query: {
            id: id,
          },
        });

        if (error) {
          setError(error.message || "Failed to fetch invitation");
        } else {
          setInvitation(data);
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsPending(false);
      }
    };

    if (id && session) {
      fetchInvitation();
    }
  }, [id, session, isSessionPending, router]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId: id,
      });

      if (error) {
        toast.error(error.message || "Failed to accept invitation");
      } else {
        toast.success("Invitation accepted successfully");
        router.push("/");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    setIsAccepting(true);
    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId: id,
      });

      if (error) {
        toast.error(error.message || "Failed to reject invitation");
      } else {
        toast.success("Invitation rejected");
        router.push("/");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isSessionPending || isPending) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
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
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Go Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You have been invited to join{" "}
            <strong>
              {invitation.organization?.name || "the organization"}
            </strong>{" "}
            as a <strong>{invitation.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once you accept, you will have access to the organization's
            workspaces and projects.
          </p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleReject}
            disabled={isAccepting}
          >
            Reject
          </Button>
          <Button
            className="flex-1"
            onClick={handleAccept}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting..." : "Accept"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
