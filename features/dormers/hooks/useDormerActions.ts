"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { dormersData } from "@/features/dormers/data";
import { paymentsData } from "@/features/payments/data";
import type {
  CreateDormerInput,
  Dormer,
  UpdateDormerInput,
} from "@/features/dormers/data";
import type { Bill, CreatePaymentInput } from "@/features/payments/data";

interface PaymentInput {
  bill_id: string;
  dormer_id: string;
  amount: number;
  payment_method: string;
  notes?: string | null;
  academic_period_id: string;
  dormitory_id: string;
}

/**
 * Mirrors the surface of the old `useDormerActions` hook but routes every
 * mutation through the data-access seam. Email-sending is mocked with a toast
 * so flows feel complete; backend dev wires real `sendEmail()` later.
 */
export function useDormerActions(_dormers: Dormer[], _bills: Bill[]) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { user } = useAuth();

  const saveDormer = async (input: CreateDormerInput) => {
    setIsSubmitting(true);
    try {
      const exists = _dormers.some((d) => d.email === input.email);
      if (exists) {
        toast.error("A dormer with this email already exists.");
        return;
      }
      await dormersData.create(input);
      toast.success("Dormer added successfully!");
      toast.message("(Welcome email would be sent in production.)");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add dormer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateDormer = async (id: string, input: UpdateDormerInput) => {
    setIsSubmitting(true);
    try {
      await dormersData.update(id, input);
      toast.success("Dormer updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update dormer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDormer = async (dormerId: string) => {
    setIsSubmitting(true);
    try {
      await dormersData.remove(dormerId);
      toast.success("Dormer deleted successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete dormer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePayment = async (paymentInput: PaymentInput) => {
    setIsSubmitting(true);
    try {
      const payload: CreatePaymentInput = {
        bill_id: paymentInput.bill_id,
        academic_period_id: paymentInput.academic_period_id,
        dormer_id: paymentInput.dormer_id,
        dormitory_id: paymentInput.dormitory_id,
        amount: paymentInput.amount,
        payment_method: paymentInput.payment_method,
        notes: paymentInput.notes ?? null,
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

  const saveBill = async (
    billInput: {
      dormer_id: string;
      dormitory_id: string;
      academic_period_id: string;
      billing_month: string;
      description: string;
      total_amount_due: number;
      regular_charge_id?: string | null;
      due_date?: string | null;
    }
  ) => {
    setIsSubmitting(true);
    try {
      await paymentsData.createBill({
        ...billInput,
        amount_paid: 0,
        status: "Unpaid",
        created_by: user?.id ?? null,
      });
      toast.success("Bill generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate bill.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const payAllBills = async (unpaidBills: Bill[]) => {
    setIsSubmitting(true);
    try {
      for (const bill of unpaidBills) {
        const remaining = Math.max(
          0,
          bill.total_amount_due - bill.amount_paid
        );
        if (remaining <= 0) continue;
        await paymentsData.recordPayment({
          bill_id: bill.id,
          academic_period_id: bill.academic_period_id,
          dormer_id: bill.dormer_id,
          dormitory_id: bill.dormitory_id,
          amount: remaining,
          payment_method: "Cash",
          notes: "Pay all bills",
          recorded_by: user?.id ?? null,
        });
      }
      toast.success("All bills marked as paid!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to pay all bills.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const importDormers = async (rows: CreateDormerInput[]) => {
    setIsSubmitting(true);
    setErrors([]);
    const errorList: string[] = [];
    try {
      for (const row of rows) {
        if (_dormers.some((d) => d.email === row.email)) {
          errorList.push(`Dormer with email ${row.email} already exists.`);
          continue;
        }
        await dormersData.create(row);
      }
      setErrors(errorList);
      if (errorList.length === 0) {
        toast.success(`Imported ${rows.length} dormer(s) successfully!`);
      } else {
        toast.warning(
          `Imported with ${errorList.length} skipped row(s). See dialog for details.`
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Import failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    saveDormer,
    updateDormer,
    deleteDormer,
    handleSavePayment,
    saveBill,
    payAllBills,
    importDormers,
    isSubmitting,
    errors,
  };
}
