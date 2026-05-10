"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { BillWithPayments } from "@/features/payments/data";

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillWithPayments | null;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  bill,
}: PaymentDetailsModalProps) {
  if (!isOpen || !bill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            A detailed breakdown of payments for bill{" "}
            <span className="font-mono">{bill.billing_month}</span> for{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {bill.dormer_full_name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.payments && bill.payments.length > 0 ? (
                bill.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium w-[120px]">
                      {formatAmount(payment.amount)}
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <span className="truncate block">
                        {formatDate(payment.created_at)}
                      </span>
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <span
                        className="truncate block"
                        title={payment.payment_method ?? ""}
                      >
                        {payment.payment_method ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <span
                        className="truncate block"
                        title={payment.recorded_by_full_name ?? "N/A"}
                      >
                        {payment.recorded_by_full_name ?? "N/A"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-gray-500"
                  >
                    No payments have been recorded for this bill yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
