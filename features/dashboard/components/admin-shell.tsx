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
import { RoleShell, type NavItem } from "./role-shell";
import { PeriodSelector } from "@/features/academic-periods/components/period-selector";
import { useDormitory } from "@/lib/hooks/useDormitory";

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Dormers",   url: "/admin/dormers",   icon: Users },
  { title: "Payments",  url: "/admin/payments",  icon: CircleDollarSign },
  { title: "Expenses",  url: "/admin/expenses",  icon: Receipt },
  { title: "Events",    url: "/admin/events",    icon: CalendarCheck },
  { title: "Fines",     url: "/admin/fines",     icon: WalletCards },
  { title: "Clearance", url: "/admin/clearance", icon: ShieldCheck },
];

const RESTRICTED_ROLES = ["treasurer", "auditor"];
const RESTRICTED_URLS  = ["/admin/events", "/admin/clearance"];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const dormitory = useDormitory();
  const { user } = useAuth();

  const navItems = RESTRICTED_ROLES.includes(user?.role ?? "")
    ? NAV_ITEMS.filter((item) => RESTRICTED_URLS.includes(item.url))
    : NAV_ITEMS;

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
      navItems={navItems}
      brandLabel="DormPay"
      brandSubLabel={dormitory?.dormitoryName ?? `Admin · ${user?.role ?? ""}`}
      userInitials={initials}
      userPrimaryLine={user?.fullName ?? null}
      userSecondaryLine={user?.email ?? null}
      variant="dorm"
      // PeriodSelector now lives in the sticky subheader strip,
      // not inside the scrollable content area
      subHeader={<PeriodSelector />}
      dorm_logo={dormitory?.logoUrl ?? null}
    >
      {children}
    </RoleShell>
  );
}