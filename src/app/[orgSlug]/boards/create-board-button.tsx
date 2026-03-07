"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateBoardDialog } from "@/components/create-board-dialog";

export function CreateBoardButton({
  orgSlug,
  variant = "default",
}: {
  orgSlug: string;
  variant?: "default" | "outline";
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsCreateDialogOpen(true)}
        className={variant === "default" ? "gap-2" : ""}
        variant={variant}
      >
        <Plus className={variant === "default" ? "h-4 w-4" : "mr-2 h-4 w-4"} />
        {variant === "default" ? "Create Board" : "New Board"}
      </Button>

      <CreateBoardDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        orgSlug={orgSlug}
      />
    </>
  );
}
