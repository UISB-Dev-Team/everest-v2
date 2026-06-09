"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoginBrandPanel } from "@/features/auth/components/login-brand-panel";
import { LoginFormPanel } from "@/features/auth/components/login-form-panel";
import { type LoginRole } from "@/features/auth/components/login-role-pills";

const ROLE_COPY: Record<LoginRole, { headline: string; sub: string }> = {
  user:  { headline: "Welcome back, dormer.",  sub: "Your dues, fines, and clearance — one tap away." },
  admin: { headline: "Welcome back, dorm admin.", sub: "Manage your dormitory with a calm dashboard." },
  super: { headline: "Welcome, super admin.",  sub: "Cross-dormitory operations and rollups." },
};

export function LoginForm({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const [role, setRole]       = useState<LoginRole>("user");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSub]  = useState(false);
  const [error, setError]     = useState(
    searchParams.get("error") === "invalid_reset_link"
      ? "That reset link is invalid or has expired. Please request a new one."
      : ""
  );

  const { headline, sub } = ROLE_COPY[role];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSub(true);
    const { error: signInError } = await signIn({ email, password });
    setSub(false);
    if (signInError) { setError(signInError); return; }
    if (role === "super") router.push("/super-admin/dashboard");
    else if (role === "admin") router.push("/admin/dashboard");
    else router.push("/dashboard");
  };

  const handleBack = () => { if (onBack) onBack(); else router.push("/"); };

  return (
    <div
      className="min-h-screen grid place-items-center px-4 py-10 sm:py-14 relative"
      style={{
        background:
          "radial-gradient(900px 600px at 85% -10%, rgba(165,214,167,0.35), transparent 60%), " +
          "radial-gradient(700px 500px at -10% 110%, rgba(46,125,50,0.22), transparent 60%), " +
          "#f7f6f2",
      }}
    >
      {/* Back chip */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-1.5 text-[13px] font-medium text-[#3a4a42] border border-[#e7e3d8] rounded-full px-3.5 py-1.5 cursor-pointer z-10 transition-all hover:-translate-x-0.5"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.85)")}
      >
        <ChevronLeft size={15} />
        Home
      </button>

      {/* Card */}
      <div
        className="w-full max-w-[520px] md:max-w-[980px] bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-[#e7e3d8] grid grid-cols-1 md:grid-cols-[1fr_1.15fr]"
        style={{ boxShadow: "0 30px 80px -32px rgba(13,22,19,0.36), 0 8px 16px -8px rgba(13,22,19,0.10)" }}
      >
        {/* Left brand panel — hidden on mobile, shown md+ */}
        <LoginBrandPanel headline={headline} sub={sub} />

        {/* Right form panel — always visible */}
        <LoginFormPanel
          role={role}
          onRoleChange={setRole}
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPass}
          showPwd={showPwd}
          onTogglePwd={() => setShowPwd((v) => !v)}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
          onForgotPassword={() => router.push("/forgot-password")}
        />
      </div>
    </div>
  );
}
