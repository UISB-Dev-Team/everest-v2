import { Wallet, AlertCircle, ShieldCheck } from "lucide-react";

const CARDS = [
  {
    num: "01",
    icon: Wallet,
    title: "Track every bill",
    desc: "See each billing period's dues, how much you've paid, and what's still outstanding — all in one place.",
    accent: "#2e7d32",
    bg: "#f2faf3",
    border: "#c8e6c9",
    numColor: "rgba(18,55,42,0.07)",
  },
  {
    num: "02",
    icon: AlertCircle,
    title: "Know your fines",
    desc: "Every fine charged to your account is listed with its reason and amount. No surprises at clearance time.",
    accent: "#b91c1c",
    bg: "#fff5f5",
    border: "#fecaca",
    numColor: "rgba(185,28,28,0.07)",
  },
  {
    num: "03",
    icon: ShieldCheck,
    title: "Check your clearance status",
    desc: "See whether you're cleared for the current academic period. Outstanding bills or fines show exactly what's blocking you.",
    accent: "#12372a",
    bg: "#edf7ee",
    border: "#a5d6a7",
    numColor: "rgba(18,55,42,0.07)",
  },
];

export function LandingFeatures() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 px-4 sm:px-8 lg:px-14 pb-10 sm:pb-14 lg:pb-20 max-w-[1320px] mx-auto w-full">
      {CARDS.map(({ num, icon: Icon, title, desc, accent, bg, border, numColor }, index) => (
        <div
          key={title}
          className={[
            "relative flex flex-col overflow-hidden",
            "rounded-[20px] sm:rounded-[24px] lg:rounded-[28px]",
            "p-5 sm:p-6 lg:p-7 transition-all cursor-default",
            index === 2
              ? "sm:col-span-2 sm:max-w-[calc(50%-8px)] sm:mx-auto sm:w-full lg:col-span-1 lg:max-w-none lg:mx-0"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ background: bg, border: `1px solid ${border}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = `0 8px 24px -8px ${accent}38, 0 2px 6px -2px ${accent}1a`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Decorative number watermark */}
          <span
            className="absolute top-2 right-3 font-black leading-none select-none pointer-events-none"
            style={{ fontSize: 64, color: numColor, letterSpacing: "-0.05em" }}
            aria-hidden
          >
            {num}
          </span>

          {/* Icon */}
          <div className="relative mb-4" style={{ color: accent }}>
            <Icon size={30} strokeWidth={1.75} />
          </div>

          {/* Text */}
          <h4
            className="relative text-[15px] sm:text-[16px] lg:text-[17px] font-bold mb-2"
            style={{ color: "#1a2b23" }}
          >
            {title}
          </h4>
          <p
            className="relative text-[13px] sm:text-sm leading-relaxed"
            style={{ color: "#5a6b62" }}
          >
            {desc}
          </p>

          {/* Per-card preview */}
          {/* <div className="relative">{preview}</div> */}
        </div>
      ))}
    </section>
  );
}
