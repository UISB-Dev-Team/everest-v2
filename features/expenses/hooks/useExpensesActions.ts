"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { expensesData } from "@/features/expenses/data";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseWithRecorder,
  UpdateExpenseInput,
} from "@/features/expenses/data";
import { useAcademicPeriod } from "@/features/academic-periods/hooks/useAcademicPeriods";
import { useDormitory } from "@/lib/hooks/useDormitory";
import { handleSendExpenseReport } from "@/emails/expenses/expenseReport";
import { Dormer } from "@/features/dormers/data";
import { listForDormitory } from "@/features/dormers/data/supabase";

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
  const { dormitoryId, dormitoryName } = useDormitory();
  const { user } = useAuth()
  const { selected: selectedPeriod } = useAcademicPeriod();
  const addExpense = async (input: AddExpenseFormInput) => {
    if (!dormitoryId || !selectedPeriod?.id) {
      toast.error("Missing dormitory or academic period.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateExpenseInput = {
        ...input,
        dormitory_id: dormitoryId,
        academic_period_id: selectedPeriod.id,
        recorded_by: user?.id || ""
      };
      await expensesData.create(payload, selectedPeriod.id);
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

  const sendReport = async (expenses: ExpenseWithRecorder[]) => {
    setIsSendingEmail(true);
    try {
      const dormers = await listForDormitory(dormitoryId!, selectedPeriod?.id!);
      await handleSendExpenseReport(expenses, dormers, setIsSendingEmail, dormitoryName!);
      toast.message("Email report sent successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send email report.");
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
