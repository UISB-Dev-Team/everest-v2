import { AuthGuard } from "@/features/auth/components/auth-guard";
import { SuperAdminShell } from "@/features/dashboard/components/super-admin-shell";

const ALLOWED_ROLES = ["super_admin"] as const;

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={ALLOWED_ROLES}>
      <SuperAdminShell>{children}</SuperAdminShell>
    </AuthGuard>
  );
}
