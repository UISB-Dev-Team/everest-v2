"use client";

import {
  CircleDollarSign,
  LayoutDashboard,
  ShieldCheck,
  WalletIcon,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDormitory } from "@/features/dashboard/hooks/useDormitory";
import { RoleShell, type NavItem } from "./role-shell";

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Payments", url: "/admin/payments", icon: CircleDollarSign },
  { title: "Fines", url: "/admin/fines", icon: WalletIcon },
  { title: "Clearance", url: "/admin/clearance", icon: ShieldCheck },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { dormitory } = useDormitory(user?.dormitoryId ?? null);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <RoleShell
      navItems={NAV_ITEMS}
      brandLabel="DormPay"
      brandSubLabel={dormitory?.name ?? `Admin · ${user?.role ?? ""}`}
      userInitials={initials}
      userPrimaryLine={user?.fullName ?? null}
      userSecondaryLine={user?.email ?? null}
      variant="dorm"
    >
      {children}
    </RoleShell>
  );
}
