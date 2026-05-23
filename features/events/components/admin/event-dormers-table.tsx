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
import { formatAmount, formatDate } from "@/lib/utils/format";
import type { EventDormerData } from "@/features/events/data";

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
  return (
    <Card className="border-2 border-gray-100 shadow-md bg-white">
      <CardHeader className="border-b border-gray-100">
        <div>
          <CardTitle className="text-xl md:text-2xl font-bold text-[#12372A]">
            Dormer Payment Status
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Track individual payment progress for this event
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {dormers.length === 0 ? (
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
              <TableRow className="bg-[#f0f0f0] hover:bg-[#f0f0f0]">
                <TableHead className="font-bold text-[#12372A]">
                  Dormer
                </TableHead>
                <TableHead className="font-bold text-[#12372A]">
                  Amount Paid
                </TableHead>
                <TableHead className="font-bold text-[#12372A]">
                  Payment Status
                </TableHead>
                <TableHead className="hidden md:table-cell font-bold text-[#12372A]">
                  Payment Date
                </TableHead>
                <TableHead className="hidden lg:table-cell font-bold text-[#12372A]">
                  Recorded By
                </TableHead>
                <TableHead className="text-right font-bold text-[#12372A]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dormers.map((dormer) => {
                const statusConfig = getStatusBadge(dormer.payment_status);
                const StatusIcon = statusConfig.icon;
                const initials = `${dormer.first_name?.[0] ?? ""}${
                  dormer.last_name?.[0] ?? ""
                }`.toUpperCase();
                const remaining = eventAmount - dormer.amount_paid;

                return (
                  <TableRow
                    key={dormer.id}
                    className="hover:bg-[#f0f0f0] transition-colors"
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
                    <TableCell className="text-right w-[160px]">
                      {dormer.payment_status !== "Paid" && dormer.payment_status !== "Waived" ? (
                        <div>
                        <Button
                          size="sm"
                          onClick={() => onLogPayment(dormer)}
                          className="bg-[#2E7D32] hover:bg-[#A5D6A7] text-white font-semibold transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Log Payment
                        </Button>

                            <Button
                              size="sm"
                              onClick={() => onWaivePayment(dormer)}
                              className="bg-[#2E7D32] hover:bg-[#A5D6A7] text-white font-semibold transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Waive Payment
                            </Button>
                          </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[#2E7D32] border-[#A5D6A7] bg-[#A5D6A7]/10 font-semibold whitespace-nowrap"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
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
  );
}
