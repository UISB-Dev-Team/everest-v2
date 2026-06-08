"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authData } from "@/features/auth/data";

const MIN_LENGTH = 8;

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= MIN_LENGTH,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const passed = checks.filter(Boolean).length;
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="space-y-1.5 animate-in fade-in duration-300">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < passed ? colors[passed - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Password strength:{" "}
        <span className="font-medium">{passed > 0 ? labels[passed - 1] : "—"}</span>
      </p>
    </div>
  );
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await authData.updatePassword(password);
    setSubmitting(false);

    if (updateError) {
      setError(updateError);
      return;
    }

    setDone(true);
    // Redirect to login after a short delay
    setTimeout(() => router.push("/login"), 2500);
  };

  return (
    <Card className="w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl border border-gray-200 bg-white backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#12372A]/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-[#12372A]" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-[#12372A]">
              Set New Password
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-0.5">
              Choose a strong password for your account.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6">
        {done ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-3 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-16 w-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-base font-semibold text-[#12372A]">Password updated!</p>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Your password has been changed successfully. Redirecting you to Sign In…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {/* New password */}
            <div className="space-y-2.5">
              <label htmlFor="new-password" className="block text-sm font-semibold text-[#12372A]">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12372A] focus:border-[#12372A] transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#12372A] transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            {/* Confirm password */}
            <div className="space-y-2.5">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-semibold text-[#12372A]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#12372A] focus:border-[#12372A] transition-all text-base ${
                    confirm && confirm !== password
                      ? "border-red-400 bg-red-50/30"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#12372A] transition-colors focus:outline-none"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="text-xs text-red-500 font-medium animate-in fade-in duration-200">
                  Passwords do not match
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full bg-[#12372A] hover:bg-[#1c4f3d] text-white py-3.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12372A] disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? "Updating…" : "Update Password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
