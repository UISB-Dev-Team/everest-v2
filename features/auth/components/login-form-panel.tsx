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
    <div className="flex flex-col justify-center items-center w-full min-h-screen px-6 py-12 sm:px-12 md:px-16 lg:px-20 bg-white">
      <div className="w-full max-w-[440px] flex flex-col gap-6">
        {/* Heading */}
        <div>
          <h2 className="text-[#1a2b23] font-extrabold text-3xl tracking-tight mb-2">
            Sign in
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Welcome to DormPay. Choose your role below to manage or access your dormitory portal.
          </p>
        </div>

        {/* Role pills */}
        <LoginRolePills role={role} onChange={onRoleChange} />

        {/* Error */}
        {error && (
          <div className="bg-[#fde7e3] text-[#b3261e] px-4 py-3.5 rounded-xl text-[13px] font-semibold border border-[#f5c2b9]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#2e7d32] transition-colors duration-200 pointer-events-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-[#fcfbf9] text-[#1a2b23] border border-[#e7e3d8] rounded-xl text-[14.5px] outline-none transition-all duration-200 py-3.5 pl-11 pr-4 focus:border-[#2e7d32] focus:bg-white focus:ring-4 focus:ring-[#2e7d32]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-[#2e7d32] font-bold bg-transparent border-0 cursor-pointer p-0 hover:underline hover:text-[#1c4f3d] transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative group">
              <ShieldCheck
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-[#2e7d32] transition-colors duration-200 pointer-events-none"
              />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#fcfbf9] text-[#1a2b23] border border-[#e7e3d8] rounded-xl text-[14.5px] outline-none transition-all duration-200 py-3.5 pl-11 pr-12 focus:border-[#2e7d32] focus:bg-white focus:ring-4 focus:ring-[#2e7d32]/10"
              />
              <button
                type="button"
                onClick={onTogglePwd}
                aria-label={showPwd ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-neutral-400 cursor-pointer p-1 rounded-md hover:text-[#3a4a42] transition-colors duration-200"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white text-[14.5px] font-bold border-0 mt-2 cursor-pointer transition-all duration-200 shadow-md ${submitting
                ? "bg-[#6b7a72] cursor-not-allowed"
                : "bg-[#12372a] hover:bg-[#1c4f3d] hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(18,55,42,0.25)] active:translate-y-0 active:shadow-md"
              }`}
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
        </form>
      </div>
    </div>
  );
}
