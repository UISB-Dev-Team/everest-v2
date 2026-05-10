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
import { formatAmount, formatDate } from "@/lib/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDormerPayments } from "@/features/payments/hooks/usePayments";
import type { Bill } from "@/features/payments/data";

function calculatePaymentSummary(bills: Bill[]) {
  const totalDue = bills.reduce((sum, b) => sum + b.total_amount_due, 0);
  const totalPaid = bills.reduce((sum, b) => sum + b.amount_paid, 0);
  return {
    totalDue,
    totalPaid,
    totalBalance: Math.max(0, totalDue - totalPaid),
  };
}

export function DormerPaymentsPage() {
  const { user } = useAuth();
  const { bills, loading } = useDormerPayments(user?.id ?? null);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="space-y-2">
            <div className="h-8 sm:h-10 w-40 sm:w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 sm:h-5 w-48 sm:w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-80 sm:h-96 bg-white rounded-xl border border-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const summary = calculatePaymentSummary(bills);
  const progress = summary.totalDue
    ? Math.min(100, Math.round((summary.totalPaid / summary.totalDue) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            My Payments
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A] mt-1 sm:mt-1.5">
            View your payable and payment history
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-md bg-white gap-0">
        <CardHeader className="border-b border-gray-100 md:pb-0">
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-[#12372A]">
            Payment Records
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
            All your dormitory payments and balances
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-3 sm:px-4">
              <div className="relative mb-4 sm:mb-6 inline-block">
                <div className="absolute inset-0 bg-gray-100/50 rounded-full blur-2xl" />
                <div className="relative p-4 sm:p-6 rounded-full bg-[#E0E0E0]">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#333333] mb-2">
                No Payment Records Found
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center max-w-md px-4">
                You don't have any payment records yet. They will appear here
                once bills are generated.
              </p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 md:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f0f0f0] hover:bg-[#f0f0f0]">
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Billing Period
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Remarks
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Amount Due
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Amount Paid
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Balance
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm hidden md:table-cell">
                        Recorded At
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => {
                      const remaining = Math.max(
                        0,
                        bill.total_amount_due - bill.amount_paid
                      );
                      const isFullyPaid = remaining === 0;
                      return (
                        <TableRow
                          key={bill.id}
                          className="hover:bg-[#f0f0f0] transition-colors"
                        >
                          <TableCell className="font-semibold text-[#333333] text-xs sm:text-sm w-[150px]">
                            {bill.billing_month}
                          </TableCell>
                          <TableCell className="font-semibold text-[#333333] text-xs sm:text-sm w-[200px]">
                            {bill.description}
                          </TableCell>
                          <TableCell className="font-semibold text-[#333333] text-xs sm:text-sm w-[120px]">
                            ₱{formatAmount(bill.total_amount_due)}
                          </TableCell>
                          <TableCell className="text-[#2E7D32] font-semibold text-xs sm:text-sm w-[120px]">
                            ₱{formatAmount(bill.amount_paid)}
                          </TableCell>
                          <TableCell
                            className={`font-semibold text-xs sm:text-sm w-[120px] ${
                              isFullyPaid ? "text-[#2E7D32]" : "text-red-600"
                            }`}
                          >
                            ₱{formatAmount(remaining)}
                          </TableCell>
                          <TableCell className="text-gray-600 text-xs sm:text-sm hidden md:table-cell w-[180px]">
                            {bill.status === "Unpaid"
                              ? "N/A"
                              : formatDate(bill.updated_at)}
                          </TableCell>
                          <TableCell className="w-[140px]">
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Summary footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  <SummaryTile
                    label="Total Amount Due"
                    value={`₱${formatAmount(summary.totalDue)}`}
                    tone="neutral"
                  />
                  <SummaryTile
                    label="Total Amount Paid"
                    value={`₱${formatAmount(summary.totalPaid)}`}
                    tone="positive"
                  />
                  <SummaryTile
                    label="Outstanding Balance"
                    value={`₱${formatAmount(summary.totalBalance)}`}
                    tone={summary.totalBalance === 0 ? "positive" : "danger"}
                  />
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
                    <span>Payment Progress</span>
                    <span className="text-[#2E7D32] font-semibold">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#2E7D32] to-[#A5D6A7] h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "positive" | "danger";
}) {
  const wrapper = {
    neutral:
      "bg-gradient-to-br from-gray-50 to-white border-gray-200 text-[#333333]",
    positive:
      "bg-gradient-to-br from-[#A5D6A7]/10 to-white border-[#A5D6A7]/30 text-[#2E7D32]",
    danger:
      "bg-gradient-to-br from-red-50 to-white border-red-200 text-red-600",
  }[tone];
  const valueColor = {
    neutral: "text-[#333333]",
    positive: "text-[#2E7D32]",
    danger: "text-red-600",
  }[tone];
  return (
    <div className={`p-4 rounded-xl border ${wrapper}`}>
      <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">
        {label}
      </p>
      <p className={`text-xl sm:text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
