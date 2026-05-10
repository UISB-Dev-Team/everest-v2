"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatAmount } from "@/lib/utils/format";
import type { BillWithPayments } from "@/features/payments/data";

export interface PaymentInput {
  bill_id: string;
  dormer_id: string;
  dormitory_id: string;
  academic_period_id: string;
  amount: number;
  payment_method: string;
  notes?: string | null;
  payment_date: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillWithPayments | null;
  onSavePayment: (input: PaymentInput) => Promise<void> | void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  bill,
  onSavePayment,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split("T")[0];
      setPaymentDate(today);
      setAmount("");
      setNotes("");
      setPaymentMethod("Cash");
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!bill) return;
    setLoading(true);
    try {
      await onSavePayment({
        bill_id: bill.id,
        dormer_id: bill.dormer_id,
        dormitory_id: bill.dormitory_id,
        academic_period_id: bill.academic_period_id,
        amount: parseFloat(amount) || 0,
        payment_method: paymentMethod,
        notes: notes || null,
        payment_date: paymentDate,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setNotes("");
    onClose();
  };

  if (!bill) return null;

  const remainingBalance = bill.remaining_balance;
  const initials = bill.dormer_full_name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-green-100 text-green-800">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                {bill.dormer_full_name} • Room {bill.dormer_room ?? "—"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Bill Summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">
                    Billing Period
                  </Label>
                  <p className="font-medium">{bill.billing_month}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Remaining Balance
                  </Label>
                  <p className="font-medium text-red-600">
                    {formatAmount(remainingBalance)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">
                    Total Amount Due
                  </Label>
                  <p>{formatAmount(bill.total_amount_due)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Amount Paid</Label>
                  <p>{formatAmount(bill.amount_paid || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                placeholder={`e.g., ${remainingBalance.toFixed(2)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  className="mt-1"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="GCash">GCash</SelectItem>
                    <SelectItem value="PayMaya">PayMaya (Maya)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="paymentNotes">
                Notes (Optional){" "}
                <span className="text-xs text-gray-500">
                  ({notes.length}/500)
                </span>
              </Label>
              <Textarea
                id="paymentNotes"
                placeholder="e.g., Partial payment for September"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handlePayment}
            disabled={!amount || parseFloat(amount) <= 0 || loading}
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
