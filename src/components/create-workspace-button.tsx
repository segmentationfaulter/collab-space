"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateOrgDialog } from "@/providers/create-org-dialog-provider";

export function CreateWorkspaceButton() {
  const { setOpen } = useCreateOrgDialog();

  return (
    <Button
      size="lg"
      className="gap-2 cursor-pointer"
      onClick={() => setOpen(true)}
    >
      <Plus className="h-5 w-5" />
      Get Started
    </Button>
  );
}
