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
import { useDormitoryFines } from "@/features/fines/hooks/useFines";

export function AdminFinesPage() {
  const { user } = useAuth();
  const { impositions, loading } = useDormitoryFines(
    user?.dormitoryId ?? null
  );

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#12372A] tracking-tight">
            Fines
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#12372A] mt-1 sm:mt-1.5">
            All fine impositions for your dormitory
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-md bg-white gap-0">
        <CardHeader className="border-b border-gray-100 md:pb-0">
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-[#12372A]">
            Fine Records
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
            Every fine charged to a dormer in your dormitory
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <Skeleton className="m-3 sm:m-6 h-64" />
          ) : impositions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-3 sm:px-4">
              <div className="relative mb-4 sm:mb-6 inline-block">
                <div className="absolute inset-0 bg-gray-100/50 rounded-full blur-2xl" />
                <div className="relative p-4 sm:p-6 rounded-full bg-[#E0E0E0]">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#333333] mb-2">
                No Fine Records Yet
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 text-center max-w-md px-4">
                Fine impositions will appear here once they're recorded.
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
                        Category
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Date
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Amount
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Paid
                      </TableHead>
                      <TableHead className="font-bold text-[#12372A] text-xs sm:text-sm">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {impositions.map((f) => (
                      <TableRow
                        key={f.id}
                        className="hover:bg-[#f0f0f0] transition-colors"
                      >
                        <TableCell className="font-semibold text-[#333333] text-xs sm:text-sm">
                          {f.dormer_full_name}
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {f.category_name}
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          {formatDate(f.date_imposed)}
                        </TableCell>
                        <TableCell className="text-[#333333] text-xs sm:text-sm">
                          ₱{formatAmount(f.amount)}
                        </TableCell>
                        <TableCell className="text-[#2E7D32] font-semibold text-xs sm:text-sm">
                          ₱{formatAmount(f.amount_paid)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${
                              f.status === "Paid"
                                ? "bg-[#A5D6A7] text-[#2E7D32]"
                                : f.status === "Waived"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {f.status}
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
