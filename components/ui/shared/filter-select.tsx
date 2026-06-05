"use client";

import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  showIcon?: boolean;
  collapseOnMobile?: boolean;
  className?: string;
}

export function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder = "Filter",
  showIcon = true,
  collapseOnMobile = false,
  className,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "border-gray-300 h-9 sm:h-10 text-sm",
          collapseOnMobile
            ? "w-10 sm:w-auto px-1 sm:px-3 gap-0 sm:gap-2"
            : "w-full sm:w-auto px-3 gap-2",
          "focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]",
          className
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapseOnMobile
              ? "justify-center sm:justify-start w-full"
              : "justify-start gap-1.5"
          )}
        >
          {showIcon && (
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-gray-500" />
          )}
          <span
            className={cn(
              collapseOnMobile ? "hidden sm:inline sm:ml-2" : "inline"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
