"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import LoginPage from "./login/page";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
