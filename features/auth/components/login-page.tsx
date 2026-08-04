"use client";

import { Suspense } from "react";
import { LandingNav } from "@/features/auth/components/landing-nav";
import { LandingHero } from "@/features/auth/components/landing-hero";
import { LandingFeatures } from "@/features/auth/components/landing-features";
import { LoginForm } from "@/features/auth/components/login-form";
import { useViewTransition } from "@/features/auth/hooks/useViewTransition";

function LoginFormSkeleton() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1fr_1.15fr] w-full animate-pulse bg-white">
      <div className="hidden md:block bg-[#12372a]/20 min-h-screen" />
      <div className="min-h-screen bg-white" />
    </div>
  );
}

function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  return (
    /* overflow-x-hidden prevents the blob / absolute elements from causing horizontal scroll */
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#f7f6f2" }}>
      <LandingNav onSignIn={onSignIn} />
      <LandingHero onSignIn={onSignIn} />
      <LandingFeatures />
      <footer className="border-t border-[#e7e3d8] text-[#6b7a72] text-[12px] sm:text-[13px] text-center px-4 py-4 sm:py-5 lg:py-6">
        © 2025 DormPay · VSU Department of Computer Science and Technology
      </footer>
    </div>
  );
}

export function LoginPage() {
  const { view, navigate, className } = useViewTransition<"landing" | "login">("landing");

  return (
    <div className={className}>
      {view === "login" ? (
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm onBack={() => navigate("landing")} />
        </Suspense>
      ) : (
        <LandingPage onSignIn={() => navigate("login")} />
      )}
    </div>
  );
}
