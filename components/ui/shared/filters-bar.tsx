"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/ui/shared/search-bar";
import { FilterSelect, type FilterOption } from "@/components/ui/shared/filter-select";
import { cn } from "@/lib/utils/cn";

export interface FiltersBarFilter {
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  /** Show active filter badge when non-default value is selected */
  defaultValue?: string;
  /** Collapse filter to icon-only on mobile */
  collapseOnMobile?: boolean;
}

interface FiltersBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FiltersBarFilter[];
  hasActiveFilters?: boolean;
  onReset?: () => void;
  /** Total result count to display */
  resultCount?: number;
  /** Singular label for results, e.g. "dormer" → "2 dormers" */
  resultLabel?: string;
  /** Optional extra badges to show active filters */
  activeFilterBadges?: { label: string }[];
  className?: string;
}

export function FiltersBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  hasActiveFilters = false,
  onReset,
  resultCount,
  resultLabel = "result",
  activeFilterBadges = [],
  className,
}: FiltersBarProps) {
  return (
    <Card className={cn("border-gray-200", className)}>
      <CardContent className="pt-4 sm:pt-5 pb-4 sm:pb-5">
        <div className="flex flex-col gap-3">
          {/* Controls row */}
          <div className="flex gap-2 items-center">
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />

            {filters.map((f, idx) => (
              <div key={idx} className="flex-shrink-0">
                <FilterSelect
                  value={f.value}
                  onValueChange={f.onValueChange}
                  options={f.options}
                  placeholder={f.placeholder}
                  collapseOnMobile={f.collapseOnMobile}
                />
              </div>
            ))}

            {hasActiveFilters && onReset && (
              <Button
                onClick={onReset}
                variant="outline"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-auto sm:px-4 border-gray-300 hover:bg-gray-50 flex-shrink-0 gap-1.5"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Reset</span>
              </Button>
            )}
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {resultCount !== undefined && (
              <span className="text-xs sm:text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-[#12372A]">
                  {resultCount}
                </span>{" "}
                {resultLabel}
                {resultCount !== 1 ? "s" : ""}
              </span>
            )}

            {activeFilterBadges.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {activeFilterBadges.map((badge, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs bg-[#A5D6A7]/20 text-[#2E7D32] hover:bg-[#A5D6A7]/30 border-[#A5D6A7]/40"
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
