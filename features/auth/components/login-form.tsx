"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

type LoginRole = "admin" | "user";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error") === "invalid_reset_link"
      ? "That reset link is invalid or has expired. Please request a new one."
      : ""
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>("user");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    const { error: signInError } = await signIn({ email, password });
    setSubmitting(false);

    if (signInError) {
      setError(signInError);
      return;
    }
    router.push(selectedRole === "admin" ? "/admin/dashboard" : "/dashboard");
  };

  const handlePasswordReset = () => {
    toast.success("forgettinh pass")
    router.push("/forgot-password");
  };

  return (
    <Card className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-2xl shadow-2xl border border-gray-200 bg-white backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl sm:text-3xl font-bold text-[#12372A] text-start">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pb-6">
        {/* Role selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[#12372A]">
            Select Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => setSelectedRole("admin")}
              variant={selectedRole === "admin" ? "default" : "outline"}
              className={`h-11 font-medium transition-all ${
                selectedRole === "admin"
                  ? "bg-[#12372A] text-white hover:bg-[#1c4f3d] border-[#12372A] shadow-md"
                  : "border-[#12372A] text-[#12372A] hover:bg-[#12372A]/5"
              }`}
            >
              Admin
            </Button>
            <Button
              type="button"
              onClick={() => setSelectedRole("user")}
              variant={selectedRole === "user" ? "default" : "outline"}
              className={`h-11 font-medium transition-all ${
                selectedRole === "user"
                  ? "bg-[#12372A] text-white hover:bg-[#1c4f3d] border-[#12372A] shadow-md"
                  : "border-[#12372A] text-[#12372A] hover:bg-[#12372A]/5"
              }`}
            >
              User
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            {message}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-2.5">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#12372A]"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12372A] focus:border-[#12372A] transition-all text-base"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#12372A]"
              >
                Password
              </label>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-sm font-medium text-[#12372A] hover:text-[#1c4f3d] hover:underline transition-all"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#12372A] focus:border-[#12372A] transition-all text-base"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#12372A] transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="w-full bg-[#12372A] hover:bg-[#1c4f3d] text-white py-3.5 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12372A] disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {submitting
              ? "Processing..."
              : `Sign In as ${selectedRole === "admin" ? "Admin" : "User"}`}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center pt-2">
          Developed by Laurente, J.R. & Dejos, P. | Department of Computer
          Science and Technology 2025
        </p>
      </CardContent>
    </Card>
  );
}
