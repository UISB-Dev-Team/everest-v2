import * as mock from "./mock";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseSummaryStats,
  ExpenseWithRecorder,
  UpdateExpenseInput,
} from "./types";

export interface ExpensesDataAccess {
  listForDormitory(dormitoryId: string): Promise<ExpenseWithRecorder[]>;
  getById(id: string): Promise<ExpenseWithRecorder | null>;
  create(input: CreateExpenseInput): Promise<Expense>;
  update(id: string, input: UpdateExpenseInput): Promise<Expense>;
  remove(id: string): Promise<void>;
  summaryForDormitory(dormitoryId: string): Promise<ExpenseSummaryStats>;
}

export const expensesData: ExpensesDataAccess = mock;

export type {
  CreateExpenseInput,
  Expense,
  ExpenseSummaryStats,
  ExpenseWithRecorder,
  UpdateExpenseInput,
} from "./types";
