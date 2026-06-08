"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authData } from "@/features/auth/data";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // The redirectTo must point to our API callback handler which will
    // exchange the code for a session, then redirect to /update-password.
    const redirectTo = `${window.location.origin}/auth/callback?next=/update-password`;

    const { error: resetError } = await authData.resetPasswordForEmail(email, redirectTo);
    setSubmitting(false);

    if (resetError) {
      setError(resetError);
      return;
    }

    setSent(true);
  };

  return (
    <Card className="w-full max-w-md sm:max-w-lg rounded-2xl shadow-2xl border border-gray-200 bg-white backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#12372A]/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-[#12372A]" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-[#12372A]">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-0.5">
              We&apos;ll send a reset link to your email.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6">
        {sent ? (
          /* ── Success state ── */
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 py-6 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="h-16 w-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-base font-semibold text-[#12372A]">Check your inbox!</p>
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                A password reset link has been sent to{" "}
                <span className="font-medium text-[#12372A]">{email}</span>. Click the link in the
                email to set a new password.
              </p>
              <p className="text-xs text-gray-400">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-[#12372A] underline underline-offset-2 font-medium"
                >
                  try again
                </button>
                .
              </p>
            </div>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-lg border border-[#12372A] text-[#12372A] text-sm font-medium hover:bg-[#12372A]/5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2.5">
              <label htmlFor="reset-email" className="block text-sm font-semibold text-[#12372A]">
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12372A] focus:border-[#12372A] transition-all text-base"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full bg-[#12372A] hover:bg-[#1c4f3d] text-white py-3.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12372A] disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? "Sending…" : "Send Reset Link"}
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-[#12372A] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
