"use client";

import { Calendar, CheckCircle2, Edit2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AcademicPeriod } from "@/features/academic-periods/data";

interface AcademicPeriodsTableProps {
  periods: AcademicPeriod[];
  onEdit: (period: AcademicPeriod) => void;
  onDelete: (period: AcademicPeriod) => void;
  onSetCurrent: (id: string) => void;
}

export default function AcademicPeriodsTable({
  periods,
  onEdit,
  onDelete,
  onSetCurrent,
}: AcademicPeriodsTableProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="p-0">
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="w-[180px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Semester
              </TableHead>
              <TableHead className="w-[200px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Academic Year
              </TableHead>
              <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Start Date
              </TableHead>
              <TableHead className="font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                End Date
              </TableHead>
              <TableHead className="w-[120px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider">
                Status
              </TableHead>
              <TableHead className="w-[120px] font-medium text-neutral-500 uppercase text-[11px] tracking-wider text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => {
              return (
                <TableRow
                  key={period.id}
                  className="hover:bg-neutral-50 transition-colors border-neutral-100"
                >
                  <TableCell className="font-medium text-[15px] text-neutral-900 capitalize">
                    {period.semester === "1st"
                      ? "1st Semester"
                      : period.semester === "2nd"
                      ? "2nd Semester"
                      : period.semester}
                  </TableCell>
                  <TableCell className="text-[14px] font-medium text-neutral-700">
                    {period.academic_year}
                  </TableCell>
                  <TableCell className="text-[14px] text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      {formatDate(period.start_date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-[14px] text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                      {formatDate(period.end_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {period.is_current ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Current
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-50 text-neutral-500 border border-neutral-200">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right align-middle w-[120px]">
                    <div className="flex justify-end items-center h-full">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          {!period.is_current && (
                            <DropdownMenuItem
                              className="text-xs font-medium py-2 cursor-pointer text-emerald-700 focus:text-emerald-700 focus:bg-emerald-50"
                              onClick={() => onSetCurrent(period.id)}
                            >
                              <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                              Set as Current
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-xs font-medium py-2 cursor-pointer"
                            onClick={() => onEdit(period)}
                          >
                            <Edit2 className="mr-2 h-3.5 w-3.5" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs font-medium py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => onDelete(period)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Remove Period
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {periods.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="text-gray-400 text-4xl">📅</div>
                    <div className="text-gray-500 text-lg font-medium">
                      No academic periods found
                    </div>
                    <div className="text-gray-400 text-sm">
                      No academic periods have been registered yet.
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
