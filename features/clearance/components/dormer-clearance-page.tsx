"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAmount } from "@/lib/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useClearanceStatus } from "@/features/clearance/hooks/useClearance";

export function DormerClearancePage() {
  const { user } = useAuth();
  const { period, loading: periodLoading } = useCurrentAcademicPeriod();
  const { status, loading: statusLoading } = useClearanceStatus(
    user?.id ?? null,
    period?.id ?? null
  );
  const loading = periodLoading || statusLoading;

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            My Clearance
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A] mt-1 sm:mt-1.5">
            {period
              ? `Clearance status for AY ${period.academic_year} · ${period.semester} semester`
              : "Loading current academic period…"}
          </p>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : !status ? (
        <Card className="border border-gray-200 shadow-md bg-white">
          <CardContent className="py-12 text-center text-sm text-gray-500">
            No clearance information available.
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-2 shadow-md gap-0 ${
            status.isCleared
              ? "border-[#A5D6A7] bg-gradient-to-br from-[#A5D6A7]/10 to-white"
              : "border-red-200 bg-gradient-to-br from-red-50 to-white"
          }`}
        >
          <CardHeader className="pb-3 sm:pb-4 border-b border-gray-100 md:pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-[#12372A]">
                  {status.isCleared ? "You're Cleared" : "Outstanding Items"}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
                  {status.isCleared
                    ? "All bills and fines are settled for this period."
                    : "Settle outstanding balances to be cleared."}
                </CardDescription>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 ${
                  status.isCleared ? "bg-[#A5D6A7]" : "bg-red-100"
                }`}
              >
                {status.isCleared ? (
                  <ShieldCheck className="h-6 w-6 text-[#2E7D32]" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <SummaryTile
                label="Unpaid Bills"
                value={`${status.unpaidBillsCount} (${formatAmount(
                  status.unpaidBillsTotal
                )})`}
                tone={status.unpaidBillsCount === 0 ? "positive" : "danger"}
              />
              <SummaryTile
                label="Unpaid Fines"
                value={`${status.unpaidFinesCount} (${formatAmount(
                  status.unpaidFinesTotal
                )})`}
                tone={status.unpaidFinesCount === 0 ? "positive" : "danger"}
              />
              <SummaryTile
                label="Outstanding Total"
                value={`${formatAmount(status.outstandingTotal)}`}
                tone={status.outstandingTotal === 0 ? "positive" : "danger"}
              />
            </div>
          </CardContent>
        </Card>
      )}
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
