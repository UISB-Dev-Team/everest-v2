import { AuthGuard } from "@/features/auth/components/auth-guard";
import { DormerShell } from "@/features/dashboard/components/dormer-shell";

const ALLOWED_ROLES = ["dormer"] as const;

export default function DormerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={ALLOWED_ROLES}>
      <DormerShell>{children}</DormerShell>
    </AuthGuard>
  );
}
