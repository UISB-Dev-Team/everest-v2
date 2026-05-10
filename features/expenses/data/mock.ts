import expensesFixture from "@/mocks/fixtures/expenses.json";
import staffFixture from "@/mocks/fixtures/staff-profiles.json";
import type {
  CreateExpenseInput,
  Expense,
  ExpenseSummaryStats,
  ExpenseWithRecorder,
  UpdateExpenseInput,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

let expenses: Expense[] = expensesFixture as Expense[];

function decorate(e: Expense): ExpenseWithRecorder {
  const staff = staffFixture.find((s) => s.id === e.recorded_by);
  return {
    ...e,
    recorded_by_full_name: staff
      ? `${staff.first_name} ${staff.last_name}`
      : null,
    recorded_by_email: staff?.email ?? null,
  };
}

export async function listForDormitory(
  dormitoryId: string
): Promise<ExpenseWithRecorder[]> {
  await delay();
  return expenses
    .filter((e) => e.dormitory_id === dormitoryId)
    .map(decorate)
    .sort((a, b) => (a.expense_date < b.expense_date ? 1 : -1));
}

export async function getById(
  id: string
): Promise<ExpenseWithRecorder | null> {
  await delay();
  const found = expenses.find((e) => e.id === id);
  return found ? decorate(found) : null;
}

export async function create(input: CreateExpenseInput): Promise<Expense> {
  await delay();
  const now = new Date().toISOString();
  const created: Expense = {
    id: input.id ?? `exp-mock-${Date.now()}`,
    academic_period_id: input.academic_period_id,
    dormitory_id: input.dormitory_id,
    title: input.title,
    description: input.description ?? null,
    amount: input.amount,
    expense_date: input.expense_date,
    category: input.category ?? null,
    receipt_image_url: input.receipt_image_url ?? null,
    recorded_by: input.recorded_by ?? null,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
  };
  expenses = [...expenses, created];
  return created;
}

export async function update(
  id: string,
  input: UpdateExpenseInput
): Promise<Expense> {
  await delay();
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error(`Expense ${id} not found`);
  const next: Expense = {
    ...expenses[idx],
    ...input,
    id,
    updated_at: new Date().toISOString(),
  } as Expense;
  expenses = expenses.map((e, i) => (i === idx ? next : e));
  return next;
}

export async function remove(id: string): Promise<void> {
  await delay();
  expenses = expenses.filter((e) => e.id !== id);
}

export async function summaryForDormitory(
  dormitoryId: string
): Promise<ExpenseSummaryStats> {
  await delay();
  const own = expenses.filter((e) => e.dormitory_id === dormitoryId);
  const totalExpenses = own.reduce((s, e) => s + e.amount, 0);

  const now = new Date();
  const monthlyExpenses = own
    .filter((e) => {
      const d = new Date(e.expense_date);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, e) => s + e.amount, 0);

  const expensesByCategory: Record<string, number> = {};
  for (const e of own) {
    const cat = e.category ?? "Uncategorized";
    expensesByCategory[cat] = (expensesByCategory[cat] ?? 0) + e.amount;
  }

  const topCategory =
    Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "—";

  return { totalExpenses, monthlyExpenses, topCategory, expensesByCategory };
}
