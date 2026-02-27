"use client";

import { useState, use, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, UserPlus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Invitation, Member, Role } from "@/types/auth";
import { Skeleton } from "@/components/ui/skeleton";

type MembersClientProps = {
  membersPromise: Promise<Member[]>;
  invitationsPromise: Promise<Invitation[]>;
  activeOrganizationId: string;
  currentUserId: string;
  currentUserRole: Role;
};

export function MembersClient({
  membersPromise,
  invitationsPromise,
  activeOrganizationId,
  currentUserId,
  currentUserRole,
}: MembersClientProps) {
  const router = useRouter();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isAdminOrOwner =
    currentUserRole === "admin" || currentUserRole === "owner";

  const handleCancelInvitation = async (invitationId: string) => {
    setIsPending(true);
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (error) {
        toast.error(error.message || "Failed to cancel invitation");
      } else {
        toast.success("Invitation cancelled");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setIsPending(true);
    try {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });

      if (error) {
        toast.error(error.message || "Failed to remove member");
      } else {
        toast.success("Member removed");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (
      !confirm(
        "Are you sure you want to leave this workspace? You will lose access to all resources.",
      )
    ) {
      return;
    }

    setIsPending(true);
    try {
      const { error } = await authClient.organization.leave({
        organizationId: activeOrganizationId,
      });

      if (error) {
        toast.error(error.message || "Failed to leave workspace");
      } else {
        toast.success("You have left the workspace");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this workspace? This action is permanent and will delete all data.",
      )
    ) {
      return;
    }

    setIsPending(true);
    try {
      const { error } = await authClient.organization.delete({
        organizationId: activeOrganizationId,
      });

      if (error) {
        toast.error(error.message || "Failed to delete workspace");
      } else {
        toast.success("Workspace deleted successfully");
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
    <div className="p-8 space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            {isAdminOrOwner
              ? `Manage your team members and invitations.`
              : `View your team members`}
          </p>
        </div>
        {isAdminOrOwner && (
          <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<MembersListSkeleton />}>
            <MembersList
              membersPromise={membersPromise}
              isAdminOrOwner={isAdminOrOwner}
              currentUserId={currentUserId}
              isPending={isPending}
              onRemoveMember={handleRemoveMember}
            />
          </Suspense>
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <InvitationsList
          invitationsPromise={invitationsPromise}
          isAdminOrOwner={isAdminOrOwner}
          isPending={isPending}
          onCancelInvitation={handleCancelInvitation}
        />
      </Suspense>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {currentUserRole === "owner" ? (
              <>
                <div>
                  <p className="font-medium">Delete Workspace</p>
                  <p className="text-sm text-muted-foreground">
                    This action is permanent and will delete all data.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteWorkspace}
                  disabled={isPending}
                >
                  Delete Workspace
                </Button>
              </>
            ) : (
              <>
                <div>
                  <p className="font-medium">Leave Workspace</p>
                  <p className="text-sm text-muted-foreground">
                    You will lose access to this workspace and its resources.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleLeaveWorkspace}
                  disabled={isPending}
                >
                  Leave Workspace
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <InviteMemberDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        organizationId={activeOrganizationId}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

function MembersList({
  membersPromise,
  isAdminOrOwner,
  currentUserId,
  isPending,
  onRemoveMember,
}: {
  membersPromise: Promise<Member[]>;
  isAdminOrOwner: boolean;
  currentUserId: string;
  isPending: boolean;
  onRemoveMember: (id: string) => Promise<void>;
}) {
  const members = use(membersPromise);

  return (
    <>
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={member.user.image || ""} />
              <AvatarFallback>
                {member.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.user.name}</p>
              <p className="text-sm text-muted-foreground">
                {member.user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="capitalize">
              {member.role}
            </Badge>
            {isAdminOrOwner && member.user.id !== currentUserId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onRemoveMember(member.id)}
                    disabled={isPending}
                  >
                    Remove Member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function InvitationsList({
  invitationsPromise,
  isAdminOrOwner,
  isPending,
  onCancelInvitation,
}: {
  invitationsPromise: Promise<Invitation[]>;
  isAdminOrOwner: boolean;
  isPending: boolean;
  onCancelInvitation: (id: string) => Promise<void>;
}) {
  const invitations = use(invitationsPromise);

  if (invitations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">{invitation.email}</p>
              <p className="text-sm text-muted-foreground capitalize">
                Role: {invitation.role}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{invitation.status}</Badge>
              {isAdminOrOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCancelInvitation(invitation.id)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MembersListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
