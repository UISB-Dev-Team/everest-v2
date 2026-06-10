"use client";

import {
  Building,
  CalendarRange,
  LayoutDashboard,
  Users,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { RoleShell, type NavItem } from "./role-shell";

const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/super-admin/dashboard", icon: LayoutDashboard },
  { title: "Dormitories", url: "/super-admin/dormitories", icon: Building },
  { title: "Advisers", url: "/super-admin/advisers", icon: Users },
  {
    title: "Academic Periods",
    url: "/super-admin/academic-periods",
    icon: CalendarRange,
  },
  { title: "Accounts", url: "/super-admin/accounts", icon: UserCog },
];

export function SuperAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

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
      brandSubLabel="Super Admin"
      userInitials={initials}
      userPrimaryLine={user?.fullName ?? null}
      userSecondaryLine={user?.email ?? null}
      variant="super-admin"
    >
      {children}
    </RoleShell>
  );
}
