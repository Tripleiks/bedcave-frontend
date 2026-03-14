"use client";

import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import LoginPage from "./login/page";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-[#00d4ff]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
