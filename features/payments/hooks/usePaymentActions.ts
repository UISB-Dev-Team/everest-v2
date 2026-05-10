"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { paymentsData } from "@/features/payments/data";
import type { CreatePaymentInput } from "@/features/payments/data";

interface PaymentInput {
  bill_id: string;
  dormer_id: string;
  dormitory_id: string;
  academic_period_id: string;
  amount: number;
  payment_method: string;
  notes?: string | null;
}

export function usePaymentActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleRecordPayment = async (input: PaymentInput) => {
    setIsSubmitting(true);
    try {
      const payload: CreatePaymentInput = {
        bill_id: input.bill_id,
        academic_period_id: input.academic_period_id,
        dormer_id: input.dormer_id,
        dormitory_id: input.dormitory_id,
        amount: input.amount,
        payment_method: input.payment_method,
        notes: input.notes ?? null,
        recorded_by: user?.id ?? null,
      };
      await paymentsData.recordPayment(payload);
      toast.success("Payment recorded successfully!");
      toast.message("(Receipt email would be sent in production.)");
    } catch (e) {
      console.error(e);
      toast.error("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleRecordPayment, isSubmitting };
}
