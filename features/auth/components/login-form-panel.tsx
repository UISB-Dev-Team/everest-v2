"use client";

import { type FormEvent } from "react";
import { Eye, EyeOff, Mail, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { LoginRolePills, type LoginRole } from "@/features/auth/components/login-role-pills";

interface LoginFormPanelProps {
  role: LoginRole;
  onRoleChange: (role: LoginRole) => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  showPwd: boolean;
  onTogglePwd: () => void;
  submitting: boolean;
  error: string;
  onSubmit: (e: FormEvent) => void;
  onForgotPassword: () => void;
}

const inputBase: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 13,
  border: "1px solid #e7e3d8",
  background: "#f7f6f2",
  fontSize: 15,
  color: "#1a2b23",
  outline: "none",
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "#2e7d32";
  e.target.style.background = "#fff";
  e.target.style.boxShadow = "0 0 0 3px rgba(46,125,50,0.12)";
}

function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = "#e7e3d8";
  e.target.style.background = "#f7f6f2";
  e.target.style.boxShadow = "none";
}

export function LoginFormPanel({
  role,
  onRoleChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPwd,
  onTogglePwd,
  submitting,
  error,
  onSubmit,
  onForgotPassword,
}: LoginFormPanelProps) {
  const roleLabel =
    role === "admin" ? "Admin" : role === "super" ? "Super Admin" : "Dormer";

  return (
    <div className="flex flex-col gap-5 p-8 sm:p-10 md:p-11">
      {/* Heading */}
      <div>
        <h2
          className="text-[#1a2b23] font-bold mb-1.5"
          style={{ fontSize: 24, letterSpacing: "-0.02em" }}
        >
          Sign in
        </h2>
        <p className="text-[#6b7a72] text-sm">
          Choose your role and enter your credentials.
        </p>
      </div>

      {/* Role pills */}
      <LoginRolePills role={role} onChange={onRoleChange} />

      {/* Error */}
      {error && (
        <div className="bg-[#fde7e3] text-[#b3261e] px-4 py-3 rounded-xl text-[13px] font-medium">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1a2b23] mb-2">
            Email
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a72] pointer-events-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={{ ...inputBase, padding: "12px 14px 12px 40px" }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[13px] font-semibold text-[#1a2b23]">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[13px] text-[#2e7d32] font-semibold bg-transparent border-0 cursor-pointer p-0 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <ShieldCheck
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b7a72] pointer-events-none"
            />
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{ ...inputBase, padding: "12px 44px 12px 40px" }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={onTogglePwd}
              aria-label={showPwd ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-0 text-[#6b7a72] cursor-pointer p-1 rounded-md hover:text-[#3a4a42]"
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-[13px] text-white text-[15px] font-semibold border-0 mt-1 transition-all"
          style={{
            background: submitting ? "#6b7a72" : "#12372a",
            cursor: submitting ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(18,55,42,0.22)",
          }}
          onMouseEnter={(e) => {
            if (!submitting) {
              e.currentTarget.style.background = "#1c4f3d";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 8px 22px rgba(18,55,42,0.28)";
            }
          }}
          onMouseLeave={(e) => {
            if (!submitting) {
              e.currentTarget.style.background = "#12372a";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(18,55,42,0.22)";
            }
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Continue as {roleLabel} <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-center text-[#6b7a72] text-[12px] mt-0.5 leading-relaxed">
          New dormer? Your dormitory admin creates your account and emails your credentials.
        </p>
      </form>
    </div>
  );
}
