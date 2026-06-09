"use client";

import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

interface LandingHeroProps {
  onSignIn: () => void;
}

export function LandingHero({ onSignIn }: LandingHeroProps) {
  return (
    <section
      className={[
        "grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]",
        "gap-2 sm:gap-6 lg:gap-16",
        "px-4 sm:px-8 lg:px-14",
        "pt-8 sm:pt-12 lg:pt-16",
        "pb-10 sm:pb-14 lg:pb-20",
        "items-center max-w-[1320px] mx-auto w-full",
      ].join(" ")}
    >
      {/* ── Illustration (shows above copy on mobile) ── */}
      <div className="relative flex items-center justify-center p-2 sm:p-5 lg:p-8 order-1 lg:order-2">
        {/* Soft blob behind the image */}
        <div
          className="absolute inset-[8%_4%_10%_8%] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #a5d6a7, transparent 60%), " +
              "radial-gradient(circle at 70% 80%, #e8f5e9, transparent 60%)",
            filter: "blur(8px)",
          }}
        />
        <Image
          src="/landing-vector1.png"
          alt="DormPay illustration"
          width={560}
          height={560}
          priority
          className="relative w-full h-auto object-contain max-w-[52vw] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[560px]"
          style={{ filter: "drop-shadow(0 20px 36px rgba(18,55,42,0.16))" }}
          sizes="(max-width: 640px) 52vw, (max-width: 768px) 340px, (max-width: 1024px) 400px, 560px"
        />
      </div>

      {/* ── Copy ── */}
      <div className="text-center lg:text-left order-2 lg:order-1">

        <h1
          className="font-extrabold text-[#1a2b23] leading-[1.04] lg:leading-[1.02]"
          style={{
            /* fluid: 28px at 320px → 72px at 1300px */
            fontSize: "clamp(28px, 7.5vw, 72px)",
            letterSpacing: "-0.035em",
          }}
        >
          Dorm payments,
          <br />
          <span
            className="text-[#2e7d32] italic font-medium"
            style={{ letterSpacing: "-0.02em" }}
          >
            finally friendly.
          </span>
        </h1>

        <p className="text-[#3a4a42] mt-3 sm:mt-4 lg:mt-5 leading-relaxed text-[14px] sm:text-base lg:text-lg max-w-[520px] mx-auto lg:mx-0">
          DormPay is your official portal for managing dormitory dues, fines,
          and clearances — without the lines, the paper receipts, or the missed
          deadlines.
        </p>

        <div className="mt-5 sm:mt-6 lg:mt-7 flex justify-center lg:justify-start">
          <button
            onClick={onSignIn}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-[13px] sm:rounded-[14px] bg-[#12372a] text-white text-[13px] sm:text-[15px] font-semibold border-0 cursor-pointer transition-all hover:-translate-y-0.5"
            style={{ boxShadow: "0 4px 12px rgba(18,55,42,0.22)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1c4f3d";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(18,55,42,0.28)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#12372a";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(18,55,42,0.22)";
            }}
          >
            Sign in to your portal <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
