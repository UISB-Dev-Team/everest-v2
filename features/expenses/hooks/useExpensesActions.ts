"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { expensesData } from "@/features/expenses/data";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "@/features/expenses/data";

interface AddExpenseFormInput {
  title: string;
  description: string;
  amount: number;
  expense_date: string;
  category: string;
  receipt_image_url: string | null;
}

export function useExpensesActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { user } = useAuth();
  const { period } = useCurrentAcademicPeriod();

  const addExpense = async (input: AddExpenseFormInput) => {
    if (!user?.dormitoryId || !period?.id) {
      toast.error("Missing dormitory or academic period.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateExpenseInput = {
        ...input,
        dormitory_id: user.dormitoryId,
        academic_period_id: period.id,
        recorded_by: user.id,
      };
      await expensesData.create(payload);
      toast.success("Expense added successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateExpense = async (id: string, input: UpdateExpenseInput) => {
    setIsSubmitting(true);
    try {
      await expensesData.update(id, input);
      toast.success("Expense updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteExpense = async (id: string) => {
    setIsSubmitting(true);
    try {
      await expensesData.remove(id);
      toast.success("Expense deleted.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendReport = async () => {
    setIsSendingEmail(true);
    try {
      // Email-sending is wired up by the backend dev. For now, just toast.
      await new Promise((r) => setTimeout(r, 300));
      toast.message("(Email report would be sent in production.)");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return {
    addExpense,
    updateExpense,
    deleteExpense,
    sendReport,
    isSubmitting,
    isSendingEmail,
  };
}
