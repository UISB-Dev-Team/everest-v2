import * as supabase from "./supabase";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseSummaryStats,
  ExpenseWithRecorder,
  UpdateExpenseInput,
} from "./types";

export interface ExpensesDataAccess {
  listForDormitory(dormitoryId: string, academicPeriodId: string): Promise<ExpenseWithRecorder[]>;
  getById(id: string): Promise<ExpenseWithRecorder | null>;
  create(input: CreateExpenseInput, academicPeriodId: string): Promise<Expense>;
  update(id: string, input: UpdateExpenseInput): Promise<Expense>;
  remove(id: string): Promise<void>;
  summaryForDormitory(dormitoryId: string, academicPeriodId: string): Promise<ExpenseSummaryStats>;
}

export const expensesData: ExpensesDataAccess = supabase;

export type {
  CreateExpenseInput,
  Expense,
  ExpenseSummaryStats,
  ExpenseWithRecorder,
  UpdateExpenseInput,
} from "./types";
