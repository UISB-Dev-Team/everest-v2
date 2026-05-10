import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

export type Expense = Tables<"expenses">;

/** Expense joined with the recorder's profile (Supabase view). */
export interface ExpenseWithRecorder extends Expense {
  recorded_by_full_name: string | null;
  recorded_by_email: string | null;
}

export type CreateExpenseInput = TablesInsert<"expenses">;
export type UpdateExpenseInput = TablesUpdate<"expenses">;

export interface ExpenseSummaryStats {
  totalExpenses: number;
  monthlyExpenses: number;
  topCategory: string;
  expensesByCategory: Record<string, number>;
}
