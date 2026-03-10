"use client";

import React, { createContext, useContext, useState } from "react";

interface CreateOrgDialogContextType {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const CreateOrgDialogContext = createContext<
  CreateOrgDialogContextType | undefined
>(undefined);

export function CreateOrgDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CreateOrgDialogContext.Provider value={{ isOpen, setOpen: setIsOpen }}>
      {children}
    </CreateOrgDialogContext.Provider>
  );
}

export function useCreateOrgDialog() {
  const context = useContext(CreateOrgDialogContext);
  if (context === undefined) {
    throw new Error(
      "useCreateOrgDialog must be used within a CreateOrgDialogProvider",
    );
  }
  return context;
}
