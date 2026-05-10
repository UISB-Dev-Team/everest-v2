"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { homePathFor } from "@/features/auth/lib/role-home";
import type { AuthRole } from "@/features/auth/data";

interface AuthGuardProps {
  allowedRoles: ReadonlyArray<AuthRole>;
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  allowedRoles,
  children,
  redirectTo = "/login",
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(homePathFor(user.role));
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
