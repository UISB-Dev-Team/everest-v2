"use client";

import {
  CircleDollarSign,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  WalletIcon,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { RoleShell, type NavItem } from "./role-shell";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { PeriodSelector } from "@/features/academic-periods/components/academic-periods-page";

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Payments", url: "/payments", icon: CircleDollarSign },
  { title: "Expenses", url: "/expenses", icon: Receipt },
  { title: "Fines", url: "/fines", icon: WalletIcon },
  { title: "Clearance", url: "/clearance", icon: ShieldCheck },
];

export function DormerShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const dormitory  = useDormitory();

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
      brandSubLabel={dormitory.dormitoryName ?? "Dormer Portal"}
      userInitials={initials}
      userPrimaryLine={user?.fullName ?? null}
      userSecondaryLine={user?.email ?? null}
      variant="dorm"
      dorm_logo={dormitory?.logoUrl}
      subHeader={
        <PeriodSelector />
      }
    >
      {children}
    </RoleShell>
  );
}
