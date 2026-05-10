"use client";

import { ShieldCheck, ShieldAlert } from "lucide-react";
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
import { formatAmount } from "@/lib/utils/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useDormitoryClearance } from "@/features/clearance/hooks/useClearance";

export function AdminClearancePage() {
  const { user } = useAuth();
  const { period, loading: periodLoading } = useCurrentAcademicPeriod();
  const { list, loading: listLoading } = useDormitoryClearance(
    user?.dormitoryId ?? null,
    period?.id ?? null
  );
  const loading = periodLoading || listLoading;

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            Clearance
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A] mt-1 sm:mt-1.5">
            {period
              ? `Clearance status for AY ${period.academic_year} · ${period.semester} semester`
              : "Loading current academic period…"}
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-md bg-white gap-0">
        <CardHeader className="border-b border-gray-100 md:pb-0">
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-[#12372A]">
            Dormer Clearance
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
            Per-dormer outstanding balances and clearance state
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <Skeleton className="m-3 sm:m-6 h-64" />
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No dormers found in this dormitory.
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
                        Unpaid Bills
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Unpaid Fines
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Outstanding
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((c) => (
                      <TableRow
                        key={c.dormerId}
                        className="hover:bg-[#f0f0f0] transition-colors"
                      >
                        <TableCell className="font-semibold text-[#333333] text-xs sm:text-sm">
                          {c.dormerFullName}
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {c.unpaidBillsCount} (
                          {formatAmount(c.unpaidBillsTotal)})
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {c.unpaidFinesCount} (
                          {formatAmount(c.unpaidFinesTotal)})
                        </TableCell>
                        <TableCell
                          className={`font-semibold text-xs sm:text-sm ${
                            c.outstandingTotal === 0
                              ? "text-[#2E7D32]"
                              : "text-red-600"
                          }`}
                        >
                          {formatAmount(c.outstandingTotal)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap ${
                              c.isCleared
                                ? "bg-[#A5D6A7] text-[#2E7D32]"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {c.isCleared ? (
                              <ShieldCheck className="h-3 w-3" />
                            ) : (
                              <ShieldAlert className="h-3 w-3" />
                            )}
                            {c.isCleared ? "Cleared" : "Not Cleared"}
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
