"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, formatDate } from "@/lib/utils/format";
import { getStatusBadgeInfo } from "@/features/dormers/lib/badge-utils";
import type { FineImpositionWithCategory } from "@/features/fines/data";

interface IndividualFinesTableProps {
  fines: FineImpositionWithCategory[];
}

export default function IndividualFinesTable({
  fines,
}: IndividualFinesTableProps) {
  const [expandedRemarks, setExpandedRemarks] = useState<
    Record<string, boolean>
  >({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleRemarks = (fineId: string) => {
    setExpandedRemarks((prev) => ({ ...prev, [fineId]: !prev[fineId] }));
  };

  const totalPages = Math.ceil(fines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFines = fines.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (fines.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="h-5 w-1 bg-gray-600 rounded" />
        <h3 className="text-sm font-semibold text-gray-700">
          Individual Fines
        </h3>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f0f0] hover:bg-[#f0f0f0]">
              <TableHead className="font-bold text-[#12372A]">
                Date Imposed
              </TableHead>
              <TableHead className="font-bold text-[#12372A]">
                Category
              </TableHead>
              <TableHead className="font-bold text-[#12372A]">
                Amount Due
              </TableHead>
              <TableHead className="font-bold text-[#12372A]">
                Amount Paid
              </TableHead>
              <TableHead className="font-bold text-[#12372A]">
                Date Paid
              </TableHead>
              <TableHead className="font-bold text-[#12372A] max-w-[20ch]">
                Remarks
              </TableHead>
              <TableHead className="font-bold text-[#12372A]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFines.map((fine) => {
              const { className, Icon } = getStatusBadgeInfo(fine.status);
              const isExpanded = expandedRemarks[fine.id] || false;
              const remarks = fine.notes ?? fine.remarks ?? "";
              const shouldTruncate = remarks.length > 20;

              return (
                <Fragment key={fine.id}>
                  <TableRow className="hover:bg-[#f0f0f0] transition-colors">
                    <TableCell className="w-[150px]">
                      <span
                        className="truncate block"
                        title={formatDate(fine.date_imposed)}
                      >
                        {formatDate(fine.date_imposed)}
                      </span>
                    </TableCell>
                    <TableCell className="w-[160px]">
                      <span className="font-medium text-[#333333]">
                        {fine.category_name}
                      </span>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      {formatAmount(fine.amount)}
                    </TableCell>
                    <TableCell className="w-[120px]">
                      {formatAmount(fine.amount_paid || 0)}
                    </TableCell>
                    <TableCell className="w-[120px]">
                      {fine.payment_date ? (
                        <span
                          className="truncate block"
                          title={formatDate(fine.payment_date)}
                        >
                          {formatDate(fine.payment_date)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-[20ch]">
                      <div className="flex items-start max-w-[20ch]">
                        <div
                          className={`flex-1 ${
                            shouldTruncate ? "line-clamp-2 max-w-[20ch]" : ""
                          } break-words pr-2`}
                        >
                          {remarks || "-"}
                        </div>
                        {shouldTruncate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRemarks(fine.id)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <Badge className={className}>
                        {Icon && (
                          <Icon className="h-4 w-4 mr-1 flex-shrink-0" />
                        )}
                        <span className="truncate">{fine.status}</span>
                      </Badge>
                    </TableCell>
                  </TableRow>

                  {isExpanded && shouldTruncate && (
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableCell colSpan={7} className="p-0 border-t-0">
                        <div className="p-3 pl-[200px] bg-gray-50 border-t border-gray-200">
                          <div className="font-medium text-sm text-gray-600 mb-1">
                            Full Remarks:
                          </div>
                          <div className="text-gray-800 whitespace-pre-wrap break-words bg-white p-3 rounded border border-gray-200">
                            {remarks}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, fines.length)} of {fines.length} fines
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
