import type { AuthRole } from "@/features/auth/data";

export const HOME_PATH_BY_ROLE: Record<AuthRole, string> = {
  dormer: "/dashboard",
  adviser: "/admin/dashboard",
  treasurer: "/admin/dashboard",
  auditor: "/admin/dashboard",
  sa: "/admin/dashboard",
  super_admin: "/super-admin/dashboard",
};

export function homePathFor(role: AuthRole | null | undefined): string {
  if (!role) return "/login";
  return HOME_PATH_BY_ROLE[role];
}
