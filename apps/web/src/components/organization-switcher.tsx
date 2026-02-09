"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Plus, ChevronsUpDown, Check, Building2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrganizationSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isCreateDialogOpen = searchParams.get("create") === "true";

  const setCreateDialogOpen = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (open) {
      params.set("create", "true");
    } else {
      params.delete("create");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const { data: organizations, isPending: isLoadingOrgs } =
    authClient.useListOrganizations();
  const { data: activeOrg, isPending: isLoadingActive } =
    authClient.useActiveOrganization();

  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [isSlugModified, setIsSlugModified] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOrganization = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await authClient.organization.create(
        {
          name: newOrgName,
          slug: newOrgSlug,
        },
        {
          onSuccess: () => {
            setCreateDialogOpen(false);
            setNewOrgName("");
            setNewOrgSlug("");
            setIsSlugModified(false);
            router.refresh();
          },
          onError: (ctx) => {
            alert(ctx.error.message);
          },
        },
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetActive = async (orgId: string) => {
    await authClient.organization.setActive(
      {
        organizationId: orgId,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  if (isLoadingOrgs || isLoadingActive) {
    return <div className="h-10 w-40 animate-pulse bg-muted rounded-md" />;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 focus-visible:ring-0"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              {activeOrg ? (
                <Avatar className="h-6 w-6 rounded-sm">
                  <AvatarImage
                    src={activeOrg.logo || ""}
                    alt={activeOrg.name}
                  />
                  <AvatarFallback className="rounded-sm text-[10px]">
                    {activeOrg.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Building2 className="h-4 w-4" />
              )}
            </div>
            <div className="flex flex-col items-start text-sm leading-tight">
              <span className="font-semibold truncate max-w-30">
                {activeOrg?.name || "Select Workspace"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>
          {organizations?.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSetActive(org.id)}
              className="flex items-center gap-2"
            >
              <Avatar className="h-6 w-6 rounded-sm">
                <AvatarImage src={org.logo || ""} alt={org.name} />
                <AvatarFallback className="rounded-sm text-[10px]">
                  {org.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{org.name}</span>
              {activeOrg?.id === org.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setNewOrgName("");
            setNewOrgSlug("");
            setIsSlugModified(false);
          }
        }}
      >
        <DialogContent>
          <form onSubmit={handleCreateOrganization}>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Add a new workspace to collaborate with your team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="Acme Inc."
                  value={newOrgName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewOrgName(name);
                    if (!isSlugModified) {
                      setNewOrgSlug(
                        name
                          .toLowerCase()
                          .replace(/ /g, "-")
                          .replace(/[^\w-]/g, ""),
                      );
                    }
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Workspace Slug</Label>
                <Input
                  id="slug"
                  placeholder="acme-inc"
                  value={newOrgSlug}
                  onChange={(e) => {
                    setNewOrgSlug(e.target.value);
                    setIsSlugModified(true);
                  }}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
