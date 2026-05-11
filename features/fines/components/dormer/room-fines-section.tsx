"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatAmount, formatDate } from "@/lib/utils/format";
import { getStatusBadgeInfo } from "@/features/dormers/lib/badge-utils";
import type { FineImpositionWithCategory } from "@/features/fines/data";

interface RoomFinesSectionProps {
  roomFines: FineImpositionWithCategory[];
}

export default function RoomFinesSection({ roomFines }: RoomFinesSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (roomFines.length === 0) return null;

  const totalPages = Math.ceil(roomFines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFines = roomFines.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="h-5 w-1 bg-blue-600 rounded" />
        <h3 className="text-sm font-semibold text-gray-700">
          Shared Fines by Room
        </h3>
        <Badge
          variant="outline"
          className="text-xs bg-blue-50 text-blue-700 border-blue-300"
        >
          {roomFines.filter((f) => f.status !== "Paid").length} Active
        </Badge>
      </div>
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4 space-y-3">
          {currentFines.map((fine) => {
            const { className, Icon } = getStatusBadgeInfo(fine.status);
            const isPaid = fine.status === "Paid";
            const remarks = fine.notes ?? fine.remarks ?? "";

            return (
              <div
                key={fine.id}
                className={`flex items-center justify-between p-3 rounded-md border ${
                  isPaid
                    ? "bg-gray-50 border-gray-200"
                    : "bg-white border-blue-200"
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{fine.category_name}</p>
                    <Badge className={className}>
                      {Icon && <Icon className="h-3 w-3 mr-1" />}
                      {fine.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Amount: {formatAmount(fine.amount)}</span>
                    <span>•</span>
                    <span>Imposed: {formatDate(fine.date_imposed)}</span>
                    {isPaid && fine.payment_date && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">
                          Paid: {formatDate(fine.payment_date)}
                        </span>
                      </>
                    )}
                  </div>

                  {remarks && (
                    <p className="text-xs text-gray-600">{remarks}</p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, roomFines.length)} of {roomFines.length} fines
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
