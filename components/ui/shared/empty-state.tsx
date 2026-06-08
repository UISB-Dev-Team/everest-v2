"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "outline";
}

interface EmptyStateProps {
  /** Icon element rendered inside the circular icon container */
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  /** Color accent: "green" (default) | "gray" */
  accent?: "green" | "gray";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  accent = "green",
  className,
}: EmptyStateProps) {
  const iconBg = accent === "green" ? "bg-[#2E7D32]" : "bg-[#E0E0E0]";
  const iconGlow =
    accent === "green" ? "bg-[#A5D6A7]/20" : "bg-gray-100/50";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-10 sm:py-14 px-4",
        className
      )}
    >
      {/* Icon container */}
      <div className="relative mb-5 sm:mb-6">
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-2xl",
            iconGlow
          )}
        />
        <div
          className={cn(
            "relative p-5 sm:p-6 rounded-full",
            iconBg
          )}
        >
          <span
            className={cn(
              "block [&>svg]:h-10 [&>svg]:w-10 [&>svg]:sm:h-12 [&>svg]:sm:w-12",
              accent === "green" ? "[&>svg]:text-white" : "[&>svg]:text-gray-600"
            )}
          >
            {icon}
          </span>
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-[#333333] mb-2 text-center">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center max-w-md mb-6">
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant === "outline" ? "outline" : "default"}
          className={cn(
            "font-semibold shadow-md hover:shadow-lg transition-all",
            action.variant !== "outline" &&
              "bg-[#2E7D32] hover:bg-[#27632a] text-white"
          )}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
