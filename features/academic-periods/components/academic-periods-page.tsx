"use client";

import { CalendarRange } from "lucide-react";
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
import { formatDate } from "@/lib/utils/format";
import { useAcademicPeriods } from "@/features/academic-periods/hooks/useAcademicPeriods";

export function AcademicPeriodsPage() {
  const { periods, loading } = useAcademicPeriods();

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 md:space-y-6">
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
            Academic Periods
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-700 mt-1 sm:mt-1.5">
            Manage academic years and semesters across all dormitories
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-md bg-white gap-0">
        <CardHeader className="border-b border-gray-100 md:pb-0">
          <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-zinc-900">
            Configured Periods
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">
            Past, current, and upcoming academic periods
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <Skeleton className="m-3 sm:m-6 h-64" />
          ) : periods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-3 sm:px-4">
              <div className="relative mb-4 sm:mb-6 inline-block">
                <div className="absolute inset-0 bg-gray-100/50 rounded-full blur-2xl" />
                <div className="relative p-4 sm:p-6 rounded-full bg-zinc-100">
                  <CalendarRange className="h-10 w-10 sm:h-12 sm:w-12 text-zinc-700" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-zinc-900 mb-2">
                No Academic Periods Configured
              </h3>
            </div>
          ) : (
            <div className="p-3 sm:p-4 md:p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f0f0f0] hover:bg-[#f0f0f0]">
                      <TableHead className="font-bold text-zinc-900 text-xs sm:text-sm">
                        Academic Year
                      </TableHead>
                      <TableHead className="font-bold text-zinc-900 text-xs sm:text-sm">
                        Semester
                      </TableHead>
                      <TableHead className="font-bold text-zinc-900 text-xs sm:text-sm">
                        Start
                      </TableHead>
                      <TableHead className="font-bold text-zinc-900 text-xs sm:text-sm">
                        End
                      </TableHead>
                      <TableHead className="font-bold text-zinc-900 text-xs sm:text-sm">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periods.map((p) => (
                      <TableRow
                        key={p.id}
                        className="hover:bg-[#f0f0f0] transition-colors"
                      >
                        <TableCell className="font-semibold text-zinc-900 text-xs sm:text-sm">
                          {p.academic_year}
                        </TableCell>
                        <TableCell className="text-zinc-900 text-xs sm:text-sm">
                          {p.semester}
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs sm:text-sm">
                          {formatDate(p.start_date)}
                        </TableCell>
                        <TableCell className="text-zinc-700 text-xs sm:text-sm">
                          {formatDate(p.end_date)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${
                              p.is_current
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100 text-zinc-700"
                            }`}
                          >
                            {p.is_current ? "Current" : "Past"}
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
