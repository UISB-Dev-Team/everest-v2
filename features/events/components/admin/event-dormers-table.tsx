"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Users,
  X,
  XCircle,
  MoreVertical,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatAmount, formatDate } from "@/lib/utils/format";
import type { EventDormerData } from "@/features/events/data";
import { DataPagination, FiltersBar } from "@/components/ui/shared";
import { useEventDormersTable } from "@/features/events/hooks/useEventDormersTable";

interface EventDormersTableProps {
  dormers: EventDormerData[];
  onLogPayment: (dormer: EventDormerData) => void;
  eventAmount: number;
  onWaivePayment: (dormer: EventDormerData) => void;
}

interface StatusConfig {
  className: string;
  icon: LucideIcon;
}

const getStatusBadge = (status: string): StatusConfig => {
  const map: Record<string, StatusConfig> = {
    Paid: {
      className:
        "bg-[#A5D6A7] text-[#2E7D32] hover:bg-[#A5D6A7] font-semibold",
      icon: CheckCircle,
    },
    Pending: {
      className:
        "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 font-semibold",
      icon: Clock,
    },
    Waived: {
      className: "bg-gray-100 text-gray-700 hover:bg-gray-100 font-semibold",
      icon: AlertCircle,
    },
    Unpaid: {
      className: "bg-red-100 text-red-800 hover:bg-red-100 font-semibold",
      icon: XCircle,
    },
  };
  return map[status] ?? map.Unpaid;
};

export default function EventDormersTable({
  dormers,
  onLogPayment,
  eventAmount,
  onWaivePayment
}: EventDormersTableProps) {
  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    sortValue, setSortValue,
    currentPage,
    filteredDormers,
    paginatedList,
    totalPages,
    hasActiveFilters,
    resetFilters,
    handlePreviousPage,
    handleNextPage,
    sortOptions,
    statusOptions,
  } = useEventDormersTable(dormers);
  
  return (
    <>
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="border-b border-gray-100">
        <div>
          <CardTitle className="text-xl md:text-2xl font-bold text-[#12372A]">
            Dormer Payment Status
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Track individual payment progress for this event
          </p>
        </div>

        <FiltersBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by name…"
          filters={[
            {
              value: statusFilter,
              onValueChange: setStatusFilter,
              options: statusOptions,
              placeholder: "Payment status",
              collapseOnMobile: true,
            },
            {
              value: sortValue,
              onValueChange: setSortValue as (v: string) => void,
              options: sortOptions,
              placeholder: "Sort by",
              collapseOnMobile: false,
            },
          ]}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
          resultCount={filteredDormers.length}
          resultLabel="dormer"
          activeFilterBadges={
            statusFilter !== "All" ? [{ label: statusFilter }] : []
          }
        />
      </CardHeader>
      <CardContent>
        {paginatedList.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="relative mb-6 inline-block">
              <div className="absolute inset-0 bg-gray-100/50 rounded-full blur-2xl" />
              <div className="relative p-6 rounded-full bg-[#E0E0E0]">
                <Users className="h-12 w-12 text-gray-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#333333] mb-2">
              No Dormers Found
            </h3>
            <p className="text-gray-600 mb-4">
              There are no dormers assigned to this event yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f5f5f5] hover:bg-[#f5f5f5]">
                <TableHead className="font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                  Dormer
                </TableHead>
                <TableHead className="font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                  Amount Paid
                </TableHead>
                <TableHead className="font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                  Payment Status
                </TableHead>
                <TableHead className="hidden md:table-cell font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                  Payment Date
                </TableHead>
                <TableHead className="hidden lg:table-cell font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                  Recorded By
                </TableHead>
                <TableHead className="text-right font-semibold text-[#12372A] text-xs uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedList.map((dormer) => {
                const statusConfig = getStatusBadge(dormer.payment_status);
                const StatusIcon = statusConfig.icon;
                const initials = `${dormer.first_name?.[0] ?? ""}${
                  dormer.last_name?.[0] ?? ""
                }`.toUpperCase();
                const remaining = eventAmount - dormer.amount_paid;

                return (
                  <TableRow
                    key={dormer.id}
                    className="hover:bg-[#fafafa] transition-colors border-b border-gray-100"
                  >
                    <TableCell className="font-medium w-[200px]">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2 border-[#A5D6A7] flex-shrink-0">
                          <AvatarFallback className="bg-[#A5D6A7] text-[#2E7D32] font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-semibold text-[#333333] max-w-[200px] truncate"
                            title={`${dormer.first_name} ${dormer.last_name}`}
                          >
                            {dormer.first_name} {dormer.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Room {dormer.room_number ?? "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[130px]">
                      <div className="font-semibold text-[#333333]">
                        {formatAmount(dormer.amount_paid)}
                      </div>
                      {dormer.payment_status === "Pending" &&
                        dormer.amount_paid > 0 && (
                          <div className="text-xs text-yellow-600">
                            Remaining: {formatAmount(remaining)}
                          </div>
                        )}
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <Badge className={statusConfig.className}>
                        <StatusIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {dormer.payment_status}
                        </span>
                      </Badge>
                      {dormer.payment_method && (
                        <div
                          className="text-xs text-gray-500 mt-1 truncate"
                          title={dormer.payment_method}
                        >
                          {dormer.payment_method}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell w-[150px]">
                      {dormer.payment_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-[#333333] truncate">
                            {formatDate(dormer.payment_date)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not paid</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell w-[200px]">
                      {dormer.recorded_by_full_name ? (
                        <div>
                          <div
                            className="text-sm font-medium text-[#333333] max-w-[200px] truncate"
                            title={dormer.recorded_by_full_name}
                          >
                            {dormer.recorded_by_full_name}
                          </div>
                          <div
                            className="text-xs text-gray-500 max-w-[200px] truncate"
                            title={dormer.recorded_by_email ?? ""}
                          >
                            {dormer.recorded_by_email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right w-[80px]">
                      {dormer.payment_status !== "Paid" && dormer.payment_status !== "Waived" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 shadow-md rounded-md p-1">
                            <DropdownMenuItem onClick={() => onLogPayment(dormer)} className="flex items-center gap-2 px-3 py-2 text-sm text-[#2E7D32] hover:bg-gray-50 rounded cursor-pointer">
                              <CreditCard className="h-4 w-4" />
                              <span>Log Payment</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onWaivePayment(dormer)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded cursor-pointer font-medium">
                              <X className="h-4 w-4" />
                              <span>Waive Payment</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="flex justify-end pr-2">
                          <Badge
                            variant="outline"
                            className="text-[#2E7D32] border-[#A5D6A7] bg-[#A5D6A7]/10 font-semibold whitespace-nowrap"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
    </Card>
    <DataPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        totalItems={filteredDormers.length}
        itemLabel="dormer"
      />
      </>
  );
}
