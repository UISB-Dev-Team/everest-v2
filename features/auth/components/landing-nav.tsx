"use client";

import { ArrowRight } from "lucide-react";

interface LandingNavProps {
  onSignIn: () => void;
}

export function LandingNav({ onSignIn }: LandingNavProps) {
  return (
    <nav
      className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e7e3d8] px-4 sm:px-8 lg:px-14 py-3 sm:py-4 lg:py-5"
      style={{ background: "rgba(247,246,242,0.88)", backdropFilter: "blur(14px)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div
          className="w-8 h-8 rounded-xl grid place-items-center font-extrabold text-[#0d2a1f] text-[13px] shrink-0"
          style={{ background: "linear-gradient(135deg, #a5d6a7, #2e7d32)" }}
        >
          DP
        </div>
        <strong
          className="text-[#1a2b23] text-[15px] sm:text-[17px]"
          style={{ letterSpacing: "-0.02em" }}
        >
          DormPay
        </strong>
      </div>

      {/* Sign in */}
      <button
        onClick={onSignIn}
        className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[10px] bg-[#12372a] text-white text-[12px] sm:text-[13px] font-semibold transition-colors hover:bg-[#1c4f3d] cursor-pointer border-0"
      >
        Sign in
        <ArrowRight size={12} className="hidden sm:block" />
      </button>
    </nav>
  );
}
