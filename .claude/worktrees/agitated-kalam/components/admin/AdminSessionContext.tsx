"use client";

import { createContext, useContext } from "react";

import type { AdminSession } from "@/lib/admin-auth";

const AdminSessionContext = createContext<AdminSession | null>(null);

export const AdminSessionProvider = ({
  session,
  children
}: {
  session: AdminSession | null;
  children: React.ReactNode;
}) => {
  return <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>;
};

export const useAdminSession = () => useContext(AdminSessionContext);
