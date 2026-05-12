"use client";

import {
  CalendarCheck,
  CircleDollarSign,
  LayoutDashboard,
  Receipt,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDormitory } from "@/features/dashboard/hooks/useDormitory";
import { RoleShell, type NavItem } from "./role-shell";
import { PeriodSelector } from "@/features/academic-periods/components/academic-periods-page";

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Dormers", url: "/admin/dormers", icon: Users },
  { title: "Payments", url: "/admin/payments", icon: CircleDollarSign },
  { title: "Expenses", url: "/admin/expenses", icon: Receipt },
  { title: "Events", url: "/admin/events", icon: CalendarCheck },
  { title: "Fines", url: "/admin/fines", icon: WalletCards },
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
      <PeriodSelector />
      {children}
    </RoleShell>
  );
}
