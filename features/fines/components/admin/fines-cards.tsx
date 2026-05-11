"use client";

import { useState } from "react";
import { Edit, PlusIcon, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FineCategory } from "@/features/fines/data";

interface FinesCardsProps {
  fines: FineCategory[];
  onAddFine: () => void;
  onEditFine: (fine: FineCategory) => void;
}

export function FinesCards({ fines, onAddFine, onEditFine }: FinesCardsProps) {
  const [page, setPage] = useState(1);
  const perPage = 5;

  return (
    <Card className="border border-gray-200 sm:border-2 shadow-md sm:shadow-lg bg-gradient-to-br from-white via-[#A5D6A7]/5 to-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-[#A5D6A7]/10 rounded-full blur-3xl -z-0" />

      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
            <CardTitle className="text-sm sm:text-base md:text-lg font-bold text-[#12372A] truncate">
              Regular Fines
            </CardTitle>
            {fines.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-[#E8F5E9] text-[#2E7D32] text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0"
              >
                {fines.length}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs sm:text-sm text-gray-600 truncate">
            Identified fines in the dorm
          </CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={onAddFine}
          className="gap-2 bg-[#2E7D32] text-white hover:bg-[#54ba59] hover:text-white w-full sm:w-auto text-xs sm:text-sm touch-manipulation active:scale-95 flex-shrink-0"
        >
          <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">Add Fine</span>
        </Button>
      </CardHeader>
      <CardContent className="relative z-10">
        {fines.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8F5E9] mb-3 sm:mb-4">
              <Wallet className="h-7 w-7 sm:h-8 sm:w-8 text-[#2E7D32]" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[#12372A] mb-1.5 sm:mb-2">
              No Fines Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4 truncate">
              Start by adding your first fine
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddFine}
              className="gap-2 bg-[#2E7D32] text-white hover:bg-[#54ba59] hover:text-white text-xs sm:text-sm"
            >
              <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">Add First Fine</span>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(typeof window !== "undefined" && window.innerWidth < 640
                ? fines.slice((page - 1) * perPage, page * perPage)
                : fines
              ).map((fine) => (
                <FineItem key={fine.id} fine={fine} onEdit={onEditFine} />
              ))}
            </div>

            {fines.length > perPage && (
              <div className="flex items-center justify-between mt-4 sm:hidden">
                <p className="text-xs text-gray-600">
                  Showing {(page - 1) * perPage + 1} to{" "}
                  {Math.min(page * perPage, fines.length)} of {fines.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 px-3 text-xs"
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-gray-700 px-2">
                    {page} / {Math.ceil(fines.length / perPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.ceil(fines.length / perPage), p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(fines.length / perPage)}
                    className="h-8 px-3 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FineItem({
  fine,
  onEdit,
}: {
  fine: FineCategory;
  onEdit: (fine: FineCategory) => void;
}) {
  return (
    <div className="group relative rounded-xl border-2 border-gray-100 bg-gradient-to-br from-white to-[#A5D6A7]/5 p-4 sm:p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.98] sm:hover:scale-[1.02]">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2E7D32] to-[#A5D6A7] rounded-l-xl" />

      <div className="flex items-start justify-between pl-2 sm:pl-3 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-[#A5D6A7]/30 flex-shrink-0">
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#2E7D32]" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-[#333333] group-hover:text-[#2E7D32] transition-colors truncate">
              {fine.name || "Untitled Fine"}
            </h3>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#2E7D32] mb-1.5 sm:mb-2 tracking-tight">
            ₱{fine.amount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
            {fine.description}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 sm:opacity-0 opacity-100 transition-all group-hover:opacity-100 hover:bg-[#2E7D32] hover:text-white active:bg-[#2E7D32] active:text-white -mt-1 -mr-1"
          onClick={() => onEdit(fine)}
          aria-label={`Edit ${fine.name}`}
        >
          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
