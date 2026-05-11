"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Eye,
  ImageIcon,
  TrendingDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, formatDate } from "@/lib/utils/format";
import type { ExpenseWithRecorder } from "@/features/expenses/data";

interface ExpensesTableProps {
  expenses: ExpenseWithRecorder[];
  onViewDetails: (expense: ExpenseWithRecorder) => void;
}

export default function ExpensesTable({
  expenses,
  onViewDetails,
}: ExpensesTableProps) {
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] =
    useState<ExpenseWithRecorder | null>(null);

  const getCategoryBadge = (category: string | null) => {
    const config: Record<string, string> = {
      Utilities: "bg-blue-100 text-blue-800 border-blue-200",
      Maintenance: "bg-orange-100 text-orange-800 border-orange-200",
      Security: "bg-purple-100 text-purple-800 border-purple-200",
      Supplies: "bg-[#A5D6A7]/30 text-[#2E7D32] border-[#A5D6A7]",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return config[category ?? "Other"] || config.Other;
  };

  const handleViewReceipt = (expense: ExpenseWithRecorder) => {
    setSelectedReceipt(expense);
    setReceiptModalOpen(true);
  };

  return (
    <>
      <Card className="border-2 border-gray-100 shadow-md bg-white gap-0">
        <CardHeader className="border-b border-gray-100 py-0">
          <CardTitle className="text-xl md:text-2xl font-bold text-[#12372A]">
            Expense Records
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Complete list of all recorded expenses
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="relative mb-0">
                <div className="absolute inset-0 bg-red-100/50 rounded-full blur-2xl" />
                <div className="relative p-6 rounded-full bg-red-600">
                  <TrendingDown className="h-12 w-12 text-white" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#333333] mb-2">
                No expenses recorded
              </h3>

              <p className="text-sm text-gray-600 text-center max-w-md mb-6">
                Get started by recording your first expense. Click the &apos;Add
                Expense&apos; button to begin tracking expenses.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto px-5">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="font-semibold text-gray-700">
                      Title &amp; Description
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Expense Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Receipt
                    </TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold text-gray-700">
                      Recorded By
                    </TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const recorderName =
                      expense.recorded_by_full_name ?? "Unknown";
                    const recorderInitials = recorderName
                      .split(" ")
                      .map((n) => n[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <TableRow
                        key={expense.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-50"
                      >
                        <TableCell className="w-[200px]">
                          <div
                            className="font-semibold text-[#333333] max-w-[200px] truncate"
                            title={expense.title}
                          >
                            {expense.title}
                          </div>
                          <div
                            className="text-sm text-gray-600 line-clamp-2 max-w-[200px] truncate"
                            title={expense.description ?? ""}
                          >
                            {expense.description}
                          </div>
                          <Badge
                            variant="outline"
                            className={`mt-1.5 border ${getCategoryBadge(expense.category)}`}
                          >
                            {expense.category ?? "Other"}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <div className="font-bold text-red-600 text-md">
                            {formatAmount(expense.amount)}
                          </div>
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium text-[#333333] truncate">
                              {formatDate(expense.expense_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReceipt(expense)}
                            className="border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D32] hover:text-white transition-all font-medium whitespace-nowrap"
                          >
                            <ImageIcon className="h-4 w-4 mr-1" /> View
                          </Button>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell w-[200px]">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border-2 border-[#A5D6A7]">
                              <AvatarFallback className="bg-[#A5D6A7] text-[#2E7D32] text-xs font-semibold">
                                {recorderInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div
                                className="text-sm font-medium text-[#333333] max-w-[200px] truncate"
                                title={recorderName}
                              >
                                {recorderName}
                              </div>
                              <div
                                className="text-xs text-gray-500 max-w-[200px] truncate"
                                title={expense.recorded_by_email ?? ""}
                              >
                                {expense.recorded_by_email ?? "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right w-[140px]">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(expense)}
                            className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all font-medium whitespace-nowrap"
                          >
                            <Eye className="h-4 w-4 mr-1" /> View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" /> Receipt Image
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedReceipt.title}</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(selectedReceipt.expense_date)}
                </p>
                <p className="text-lg font-bold text-red-600">
                  {formatAmount(selectedReceipt.amount)}
                </p>
              </div>
              <div className="border rounded-lg overflow-hidden">
                {selectedReceipt.receipt_image_url ? (
                  <Image
                    src={selectedReceipt.receipt_image_url}
                    alt="Receipt"
                    width={500}
                    height={500}
                    className="w-full h-auto max-h-96 object-contain"
                  />
                ) : (
                  <div className="text-sm text-center text-gray-500 p-4">
                    No receipt image available.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
