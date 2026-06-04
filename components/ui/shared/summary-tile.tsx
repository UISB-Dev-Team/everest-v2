"use client";

import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "positive" | "danger";

interface SummaryTileProps {
  label: string;
  value: string;
  tone?: Tone;
  className?: string;
}

const TONE_STYLES: Record<Tone, { wrapper: string; value: string }> = {
  neutral: {
    wrapper: "bg-gradient-to-br from-gray-50 to-white border-gray-200",
    value: "text-[#333333]",
  },
  positive: {
    wrapper:
      "bg-gradient-to-br from-[#A5D6A7]/10 to-white border-[#A5D6A7]/30",
    value: "text-[#2E7D32]",
  },
  danger: {
    wrapper: "bg-gradient-to-br from-red-50 to-white border-red-200",
    value: "text-red-600",
  },
};

export function SummaryTile({
  label,
  value,
  tone = "neutral",
  className,
}: SummaryTileProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "p-4 rounded-xl border",
        styles.wrapper,
        className
      )}
    >
      <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">
        {label}
      </p>
      <p className={cn("text-xl sm:text-2xl font-bold", styles.value)}>
        {value}
      </p>
    </div>
  );
}
