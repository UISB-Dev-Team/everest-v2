import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface LoginBrandPanelProps {
  headline: string;
  sub: string;
}

export function LoginBrandPanel({ headline, sub }: LoginBrandPanelProps) {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-12 lg:p-14 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(700px 500px at 20% 0%, rgba(46,125,50,0.4), transparent 70%), " +
          "linear-gradient(160deg, #12372a 0%, #0d2a1f 100%)",
        color: "#fff",
      }}
    >
      {/* Decorative Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Dynamic Animated Glow accent */}
      <motion.div
        animate={{
          scale: [1, 1.08, 0.96, 1],
          opacity: [0.25, 0.35, 0.22, 0.25],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute pointer-events-none rounded-full"
        style={{
          right: "-10%",
          bottom: "-20%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(165,214,167,0.3) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />

      {/* Brand mark */}
      <div className="flex items-center gap-3 relative z-10">
        <Image
          src="/profile.png"
          alt="DormPay Logo"
          width={44}
          height={44}
          priority
          className="w-10 h-10 lg:w-11 lg:h-11 rounded-[13px] shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
        />
        <div>
          <div className="font-bold leading-none" style={{ fontSize: 18, letterSpacing: "-0.02em" }}>
            DormPay
          </div>
          <div className="mt-1.5 inline-block text-[9px] tracking-wider font-bold bg-white/10 text-white/95 px-2.5 py-0.5 rounded-full border border-white/5 backdrop-blur-md uppercase">
            VSU residence portal
          </div>
        </div>
      </div>

      {/* Role-reactive headline */}
      <div className="relative z-10 min-h-[140px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={headline}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              className="font-bold leading-[1.08] mb-3 tracking-tight text-balance"
              style={{ fontSize: "clamp(26px, 2.8vw, 38px)" }}
            >
              {headline}
            </h2>
            <p className="leading-relaxed max-w-[320px] text-white/75" style={{ fontSize: 14.5 }}>
              {sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-[11px] text-white/50">
        © 2025 DormPay · VSU Dept. of CS&T
      </div>
    </div>
  );
}
