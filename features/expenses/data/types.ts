import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

export type Expense = Tables<"expenses">;

/** Expense joined with the recorder's profile (Supabase view). */
export interface ExpenseWithRecorder extends Expense {
  recordedByFullName: string | null;
  recordedByEmail: string | null;
}

export type CreateExpenseInput = TablesInsert<"expenses">;
export type UpdateExpenseInput = TablesUpdate<"expenses">;

export interface ExpenseSummaryStats {
  totalExpenses: number;
  monthlyExpenses: number;
  topCategory: string;
  expensesByCategory: Record<string, number>;
}