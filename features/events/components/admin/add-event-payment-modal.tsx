"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Calendar, DollarSign, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { formatAmount } from "@/lib/utils/format";
import type { Event, EventDormerData } from "@/features/events/data";

export interface AddEventPaymentInput {
  event_id: string;
  dormer_id: string;
  dormitory_id: string;
  academic_period_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes: string | null;
}

interface AddEventPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dormer: EventDormerData | null;
  event: Event | null;
  onSave: (input: AddEventPaymentInput) => Promise<void> | void;
}

export default function AddEventPaymentModal({
  isOpen,
  onClose,
  dormer,
  event,
  onSave,
}: AddEventPaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentNotes, setPaymentNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentAmount("");
      setPaymentMethod("cash");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentNotes("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!paymentMethod || !paymentDate || !event || !dormer) {
        toast.error("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }
      const amount = Number.parseFloat(paymentAmount);
      await onSave({
        event_id: event.id,
        dormer_id: dormer.id,
        dormitory_id: event.dormitory_id,
        academic_period_id: event.academic_period_id,
        amount: event.amount_due,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        notes: paymentNotes || null,
      });
      onClose();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error("Failed to save payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!dormer || !event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Log Event Payment
          </DialogTitle>
          <DialogDescription>
            Record payment for <strong>{event.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">
                Dormer Information
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-medium">
                  {dormer.first_name} {dormer.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Room:</span>
                <span className="font-medium">
                  {dormer.room_number ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount Due:</span>
                <span className="font-medium text-green-600">
                  {formatAmount(event.amount_due)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₱
                </span>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  max={event.amount_due}
                  placeholder="0.00"
                  className="pl-8"
                  value={event.amount_due}
                  required
                  disabled={true}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="paymentDate"
                  type="date"
                  className="pl-10"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gcash">GCash</SelectItem>
                <SelectItem value="paymaya">PayMaya</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentNotes">
              Notes (Optional){" "}
              <span className="text-xs text-gray-500">
                ({paymentNotes.length}/500)
              </span>
            </Label>
            <Textarea
              id="paymentNotes"
              placeholder="Add any additional notes..."
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              maxLength={500}
              className="min-h-[60px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
