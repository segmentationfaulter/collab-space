"use client";

import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TRPCProvider } from "@/trpc/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      {children}
      <Toaster richColors closeButton position="top-right" />
    </TRPCProvider>
  );
}
