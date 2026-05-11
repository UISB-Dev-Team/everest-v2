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
import type { FineImpositionWithCategory } from "@/features/fines/data";

export interface FinePaymentInput {
  imposition_id: string;
  dormer_id: string;
  dormitory_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes?: string | null;
}

interface FinePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fine: FineImpositionWithCategory | null;
  onSavePayment: (input: FinePaymentInput) => Promise<void> | void;
}

export default function FinePaymentModal({
  isOpen,
  onClose,
  fine,
  onSavePayment,
}: FinePaymentModalProps) {
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

  if (!fine) return null;

  const remainingBalance = fine.amount - (fine.amount_paid || 0);

  const handlePayment = async () => {
    setLoading(true);
    try {
      await onSavePayment({
        imposition_id: fine.id,
        dormer_id: fine.dormer_id,
        dormitory_id: fine.dormitory_id,
        amount: parseFloat(amount) || 0,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        notes: notes || null,
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

  const initials = fine.dormer_full_name
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
              <AvatarFallback className="bg-red-100 text-red-800">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>Record Fine Payment</DialogTitle>
              <DialogDescription>
                {fine.dormer_full_name} • Room {fine.dormer_room ?? "—"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Fine Summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-gray-500">Fine ID</Label>
                  <p className="font-medium">
                    {fine.id.slice(-8).toUpperCase()}
                  </p>
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
                  <p>{formatAmount(fine.amount)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Amount Paid</Label>
                  <p>{formatAmount(fine.amount_paid || 0)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-500">Category</Label>
                  <p>{fine.category_name}</p>
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
                placeholder="e.g., Payment for property damage fine"
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
            className="bg-red-600 hover:bg-red-700 text-white"
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
