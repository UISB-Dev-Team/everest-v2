interface LoginBrandPanelProps {
  headline: string;
  sub: string;
}

export function LoginBrandPanel({ headline, sub }: LoginBrandPanelProps) {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-10 lg:p-12 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(600px 400px at 20% 0%, rgba(28,79,61,0.65), transparent 60%), " +
          "linear-gradient(160deg, #12372a 0%, #0d2a1f 100%)",
        color: "#fff",
      }}
    >
      {/* Glow accent */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          right: "-20%",
          bottom: "-30%",
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(165,214,167,0.2) 0%, transparent 60%)",
        }}
      />

      {/* Brand mark */}
      <div className="flex items-center gap-3 relative">
        <div
          className="w-10 h-10 lg:w-11 lg:h-11 rounded-[13px] grid place-items-center font-extrabold text-[#0d2a1f] text-base lg:text-[17px] shrink-0"
          style={{
            background: "radial-gradient(circle at 30% 30%, #c8e6c9 0%, #a5d6a7 40%, #2e7d32 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.18)",
            letterSpacing: "-0.02em",
          }}
        >
          DP
        </div>
        <div>
          <div className="font-bold leading-none" style={{ fontSize: 18, letterSpacing: "-0.02em" }}>
            DormPay
          </div>
          <div
            className="mt-0.5 uppercase tracking-widest"
            style={{ fontSize: 10, opacity: 0.6 }}
          >
            VSU residence portal
          </div>
        </div>
      </div>

      {/* Role-reactive headline */}
      <div className="relative">
        <h2
          className="font-bold leading-[1.1] mb-2.5"
          style={{ fontSize: "clamp(24px, 2.6vw, 36px)", letterSpacing: "-0.025em" }}
        >
          {headline}
        </h2>
        <p className="leading-relaxed max-w-[280px]" style={{ fontSize: 14, opacity: 0.72 }}>
          {sub}
        </p>
      </div>

      {/* Footer */}
      <div className="relative" style={{ fontSize: 11, opacity: 0.5 }}>
        © 2025 DormPay · VSU Dept. of CS&T
      </div>
    </div>
  );
}
