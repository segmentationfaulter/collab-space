"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { useCreateOrgDialog } from "@/hooks/use-create-org-dialog";
import { Organization } from "@/lib/auth";
import { toast } from "sonner";
import {
  findOrganizationById,
  findOrganizationBySlug,
} from "@/utils/organization";

export function OrganizationSwitcher({
  organizations,
  activeOrganizationId,
}: {
  organizations: Organization[];
  activeOrganizationId?: string | null;
}) {
  const router = useRouter();
  const params = useParams();
  const orgSlug = params?.orgSlug as string | undefined;

  const { isOpen: isCreateDialogOpen, setOpen: setCreateDialogOpen } =
    useCreateOrgDialog();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("create") === "true") {
      setCreateDialogOpen(true);
      // Remove the query param without triggering a full navigation
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, setCreateDialogOpen]);

  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [isSlugModified, setIsSlugModified] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Determine active org based on URL slug first, then fallback to session-based active id
  const activeOrg = orgSlug
    ? findOrganizationBySlug(organizations, orgSlug)
    : findOrganizationById(organizations, activeOrganizationId) ||
      organizations[0];

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
          onSuccess: (ctx) => {
            setCreateDialogOpen(false);
            setNewOrgName("");
            setNewOrgSlug("");
            setIsSlugModified(false);
            toast.success("Workspace created successfully");
            router.push(`/${ctx.data.slug}`);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSwitch = async (org: Organization) => {
    // Optional: set active on server too so header is consistent on reload
    await authClient.organization.setActive(
      {
        organizationId: org.id,
      },
      {
        onSuccess: () => {
          router.push(`/${org.slug}`);
        },
      },
    );
  };

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
              onClick={() => handleSwitch(org)}
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
              <Field>
                <FieldLabel htmlFor="name">Workspace Name</FieldLabel>
                <FieldContent>
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
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="slug">Workspace Slug</FieldLabel>
                <FieldContent>
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
                </FieldContent>
              </Field>
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
