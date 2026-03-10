"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TRPCProvider } from "@/trpc/client";
import { CreateOrgDialogProvider } from "@/providers/create-org-dialog-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <CreateOrgDialogProvider>{children}</CreateOrgDialogProvider>
      <Toaster richColors closeButton position="top-right" />
    </TRPCProvider>
  );
}
