"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
  className?: string;
}

export function DataPagination({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  totalItems,
  pageSize,
  itemLabel = "item",
  className,
}: DataPaginationProps) {
  const showRange = totalItems !== undefined && pageSize !== undefined;
  const rangeStart = showRange ? (currentPage - 1) * pageSize! + 1 : null;
  const rangeEnd = showRange
    ? Math.min(currentPage * pageSize!, totalItems!)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-4",
        className
      )}
    >
      {/* Left: page info */}
      <span className="text-xs sm:text-sm text-gray-500 font-medium">
        {showRange ? (
          <>
            Showing{" "}
            <span className="font-semibold text-[#12372A]">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#12372A]">{totalItems}</span>{" "}
            {itemLabel}
            {totalItems !== 1 ? "s" : ""}
          </>
        ) : (
          <>
            Page{" "}
            <span className="font-semibold text-[#12372A]">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-[#12372A]">
              {totalPages || 1}
            </span>
          </>
        )}
      </span>

      {/* Right: navigation */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className={cn(
            "flex-1 sm:flex-none gap-1.5",
            "border-[#2E7D32] text-[#2E7D32]",
            "hover:bg-[#2E7D32] hover:text-white",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-all text-xs sm:text-sm"
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>

        {/* Page number pill */}
        <span className="hidden sm:flex items-center justify-center min-w-[2.5rem] h-9 rounded-md border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 px-3 select-none">
          {currentPage}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className={cn(
            "flex-1 sm:flex-none gap-1.5",
            "border-[#2E7D32] text-[#2E7D32]",
            "hover:bg-[#2E7D32] hover:text-white",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-all text-xs sm:text-sm"
          )}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
