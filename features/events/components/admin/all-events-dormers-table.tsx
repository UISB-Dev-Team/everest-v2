"use client";

import {
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Users,
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
import { formatAmount } from "@/lib/utils/format";
import type { EventPayable } from "@/features/events/data";
import DormerFilters from "@/features/dormers/components/admin/dormer-filters";
import { useState, useMemo } from "react";

interface AllEventsDormersTableProps {
  payables: EventPayable[];
  onViewPayables: (dormer: EventPayable) => void;
}

export default function AllEventsDormersTable({
  payables,
  onViewPayables,
}: AllEventsDormersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPayables = useMemo(() => {
    return payables.filter((payable) => {
      const searchStr = `${payable.first_name ?? ""} ${payable.last_name ?? ""}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || payable.room_number === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payables, searchTerm, statusFilter]);

  return (
    <Card className="border-2 border-gray-100 shadow-md bg-white">
      <CardHeader className="border-b border-gray-100">
        <div>
          <CardTitle className="text-xl md:text-2xl font-bold text-[#12372A]">
            Dormer Event Payables
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Overview of event payables and pending balances for all dormers
          </p>
        </div>

        <DormerFilters
          searchTerm={searchTerm}
          onSearchChange={(e) => {setSearchTerm(e.target.value)}}
          statusFilter={statusFilter}
          onStatusChange={(status) => {setStatusFilter(status)}}
          count={filteredPayables?.length}
          resetFilter={() => {
            setSearchTerm("");
            setStatusFilter("All");
            }}
        />
      </CardHeader>
      <CardContent>
        {filteredPayables?.length === 0 ? (
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
              There are no active dormers with event payables at the moment.
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
                  Pending Amount
                </TableHead>
                <TableHead className="font-bold text-[#12372A]">
                  Status
                </TableHead>
                <TableHead className="text-right font-bold text-[#12372A]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayables.map((dormer) => {
                const totalPaid = dormer.event_payments
                  .filter((p) => p.status === "Paid")
                  .reduce((sum, p) => sum + (p.amount ?? 0), 0);
                
                const pendingCount = dormer.pending_payable_events.length;
                const pendingAmount = dormer.pending_payable_amount;

                const initials = `${dormer.first_name?.[0] ?? ""}${
                  dormer.last_name?.[0] ?? ""
                }`.toUpperCase();

                const isFullyPaid = pendingCount === 0;

                return (
                  <TableRow
                    key={dormer.id}
                    className="hover:bg-[#f0f0f0] transition-colors"
                  >
                    <TableCell className="font-medium w-[250px]">
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
                    <TableCell className="w-[150px]">
                      <div className="font-semibold text-[#2E7D32]">
                        {formatAmount(totalPaid)}
                      </div>
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <div className="font-semibold text-red-600">
                        {formatAmount(pendingAmount)}
                      </div>
                      {pendingCount > 0 && (
                        <div className="text-xs text-gray-500">
                          {pendingCount} event(s) pending
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="w-[140px]">
                      {isFullyPaid ? (
                        <Badge className="bg-[#A5D6A7] text-[#2E7D32] hover:bg-[#A5D6A7] font-semibold">
                          <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>Cleared</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 font-semibold">
                          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>Pending</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right w-[160px]">
                      <Button
                        size="sm"
                        onClick={() => onViewPayables(dormer)}
                        variant="outline"
                        className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Payables
                      </Button>
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
