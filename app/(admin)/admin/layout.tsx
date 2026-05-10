import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AdminShell } from "@/features/dashboard/components/admin-shell";

const ALLOWED_ROLES = ["adviser", "treasurer", "auditor", "sa"] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={ALLOWED_ROLES}>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
