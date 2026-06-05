"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type StatusBadgeVariant =
  | "paid"
  | "partial"
  | "unpaid"
  | "cleared"
  | "not-cleared"
  | "waived"
  | (string & {}); // allow arbitrary strings with fallback

interface StatusBadgeProps {
  status: StatusBadgeVariant;
  /** Override the auto-detected icon entirely */
  icon?: React.ReactNode;
  className?: string;
}

const STATUS_CONFIG: Record<
  string,
  { className: string; icon?: React.ReactNode; label?: string }
> = {
  paid: {
    className: "bg-[#A5D6A7] text-[#2E7D32]",
  },
  partial: {
    className: "bg-yellow-100 text-yellow-800",
  },
  unpaid: {
    className: "bg-red-100 text-red-800",
  },
  cleared: {
    className: "bg-[#A5D6A7] text-[#2E7D32]",
    icon: <ShieldCheck className="h-3 w-3" />,
    label: "Cleared",
  },
  "not-cleared": {
    className: "bg-red-100 text-red-800",
    icon: <ShieldAlert className="h-3 w-3" />,
    label: "Not Cleared",
  },
  waived: {
    className: "bg-gray-100 text-gray-700",
  },
};

export function StatusBadge({ status, icon, className }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(" ", "-");
  const config = STATUS_CONFIG[key] ?? { className: "bg-gray-100 text-gray-700" };

  const displayIcon = icon ?? config.icon;
  const displayLabel = config.label ?? status;

  return (
    <span
      className={cn(
        "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold",
        "inline-flex items-center gap-1 whitespace-nowrap",
        config.className,
        className
      )}
    >
      {displayIcon}
      {displayLabel}
    </span>
  );
}
