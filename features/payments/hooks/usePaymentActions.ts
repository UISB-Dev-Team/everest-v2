"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Bill, paymentsData, type CreatePaymentInput } from "@/features/payments/data";
import { useAcademicPeriod } from "@/lib/hooks/useAcademicPeriod";
import { useDormitory } from "@/lib/hooks/useDormitory";

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
  const { current: academicPeriod } = useAcademicPeriod();
  const { dormitoryId } = useDormitory();
  const { user } = useAuth();

  const handleRecordPayment = async (input: any) => {
    setIsSubmitting(true);
    try {
      await paymentsData.recordPayment(
        input,
        academicPeriod?.id ?? "",
        dormitoryId ?? "",
        user?.id ?? "",
      );
      toast.success("Payment recorded successfully!");
      toast.message("(Receipt email would be sent in production.)");
    } catch (e) {
      console.error(e);
      toast.error("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayAllBills = async (bills: Bill[]) => {
    setIsSubmitting(true);
    try {
      for (const bill of bills) {
        console.log("Bill", bill);
        await paymentsData.recordPayment(
          {
            bill_id: bill.id,
            dormer_id: bill.dormer_id,
            dormitory_id: bill.dormitory_id,
            academic_period_id: bill.academic_period_id,
            amount_paid: (bill.total_amount_due - (bill.amount_paid ?? 0)),
            payment_method: "Cash",
            notes: "Paid via Admin",
          },
          academicPeriod?.id ?? "",
          dormitoryId ?? "",
          user?.id ?? "",
        );
        toast.success("Bills paid successfully!");
        toast.message("(Receipt email would be sent in production.)");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to pay bills.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleRecordPayment, handlePayAllBills, isSubmitting };
}
