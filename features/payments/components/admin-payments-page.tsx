"use client";

import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount, formatDate } from "@/lib/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDormitoryBills } from "@/features/payments/hooks/usePayments";

export function AdminPaymentsPage() {
  const { bills, loading } = useDormitoryBills();

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            Payments
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A] mt-1 sm:mt-1.5">
            Manage all bills generated for your dormitory
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-md bg-white gap-0">
        <CardHeader className="border-b border-gray-100 md:pb-0">
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-[#12372A]">
            Bills
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
            Every bill across the dormitory and its current status
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <Skeleton className="m-3 sm:m-6 h-64" />
          ) : bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-3 sm:px-4">
              <div className="relative mb-4 sm:mb-6 inline-block">
                <div className="absolute inset-0 bg-gray-100/50 rounded-full blur-2xl" />
                <div className="relative p-4 sm:p-6 rounded-full bg-[#E0E0E0]">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#333333] mb-2">
                No Bills Yet
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center max-w-md px-4">
                Bills will appear here once they're generated for dormers.
              </p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 md:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f0f0f0] hover:bg-[#f0f0f0]">
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Dormer
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Period
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Description
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Amount Due
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Paid
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm hidden md:table-cell">
                        Due Date
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow
                        key={bill.id}
                        className="hover:bg-[#f0f0f0] transition-colors"
                      >
                        <TableCell className="font-semibold text-[#333333] text-xs sm:text-sm">
                          {bill.dormer_full_name}
                          {bill.dormer_room && (
                            <span className="ml-1 text-gray-400">
                              · {bill.dormer_room}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {bill.billing_month}
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {bill.description}
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {formatAmount(bill.total_amount_due)}
                        </TableCell>
                        <TableCell className="text-[#2E7D32] font-semibold text-xs sm:text-sm">
                          {formatAmount(bill.amount_paid)}
                        </TableCell>
                        <TableCell className="text-gray-600 text-xs sm:text-sm hidden md:table-cell">
                          {bill.due_date ? formatDate(bill.due_date) : "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${
                              bill.status === "Paid"
                                ? "bg-[#A5D6A7] text-[#2E7D32]"
                                : bill.status === "Partial"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bill.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
