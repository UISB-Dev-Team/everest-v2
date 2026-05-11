import billsFixture from "@/mocks/fixtures/bills.json";
import impositionsFixture from "@/mocks/fixtures/fine-impositions.json";
import categoriesFixture from "@/mocks/fixtures/fines.json";
import dormersFixture from "@/mocks/fixtures/dormers.json";
import dormitoriesFixture from "@/mocks/fixtures/dormitories.json";
import periodsFixture from "@/mocks/fixtures/academic-periods.json";
import paymentsFixture from "@/mocks/fixtures/payments.json";
import expensesFixture from "@/mocks/fixtures/expenses.json";
import staffFixture from "@/mocks/fixtures/staff-profiles.json";
import type { Bill, Payment } from "@/features/payments/data";
import type { Expense } from "@/features/expenses/data";
import type {
  FineCategory,
  FineImposition,
  FineImpositionWithCategory,
} from "@/features/fines/data";
import type { AcademicPeriod } from "@/features/academic-periods/data";
import type {
  AdminDashboardSnapshot,
  DormerDashboardSnapshot,
  RecentTransaction,
  SuperAdminDashboardSnapshot,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const bills = billsFixture as Bill[];
const impositions = impositionsFixture as FineImposition[];
const categories = categoriesFixture as FineCategory[];
const payments = paymentsFixture as Payment[];
const periods = periodsFixture as AcademicPeriod[];
const expenses = expensesFixture as Expense[];

function decorateImposition(imp: FineImposition): FineImpositionWithCategory {
  const cat = categories.find((c) => c.id === imp.fine_id);
  const dormer = dormersFixture.find((d) => d.id === imp.dormer_id);
  return {
    ...imp,
    category_name: cat?.name ?? "Unknown",
    category_description: cat?.description ?? null,
    dormer_full_name: dormer
      ? `${dormer.first_name} ${dormer.last_name}`
      : "Unknown",
    dormer_room: dormer?.room_number ?? null,
    room_fine_id: null,
    room_number: dormer?.room_number ?? null,
  };
}

export async function getDormerSnapshot(
  dormerId: string
): Promise<DormerDashboardSnapshot> {
  await delay();
  const dormerBills = bills.filter((b) => b.dormer_id === dormerId);
  const dormerFines = impositions.filter((i) => i.dormer_id === dormerId);
  const totalBilled = dormerBills.reduce((s, b) => s + b.total_amount_due, 0);
  const totalPaid = dormerBills.reduce((s, b) => s + b.amount_paid, 0);
  return {
    totalBilled,
    totalPaid,
    outstanding: totalBilled - totalPaid,
    recentBills: dormerBills.slice(0, 5),
    recentFines: dormerFines.slice(0, 5).map(decorateImposition),
  };
}

export async function getAdminSnapshot(
  dormitoryId: string
): Promise<AdminDashboardSnapshot> {
  await delay();
  const dormBills = bills.filter((b) => b.dormitory_id === dormitoryId);
  const dormPayments = payments.filter((p) => p.dormitory_id === dormitoryId);
  const dormFines = impositions.filter(
    (i) => i.dormitory_id === dormitoryId
  );
  const dormExpenses = expenses.filter(
    (e) => e.dormitory_id === dormitoryId
  );
  const dormerCount = dormersFixture.filter(
    (d) => d.dormitory_id === dormitoryId
  ).length;

  const totalBilled = dormBills.reduce((s, b) => s + b.total_amount_due, 0);
  const totalCollected = dormPayments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = dormExpenses.reduce((s, e) => s + e.amount, 0);
  const totalAmountPaid = dormBills.reduce((s, b) => s + b.amount_paid, 0);
  const unpaidFinesTotal = dormFines.reduce(
    (s, f) => s + (f.amount - f.amount_paid),
    0
  );

  // Recent transactions: top 5 across payments + expenses, sorted by date.
  const formattedPayments: RecentTransaction[] = dormPayments.map((p) => {
    const dormer = dormersFixture.find((d) => d.id === p.dormer_id);
    const bill = bills.find((b) => b.id === p.bill_id);
    const dormerName = dormer
      ? `${dormer.first_name} ${dormer.last_name}`
      : "Unknown";
    return {
      id: `pay-${p.id}`,
      type: "payment",
      date: p.created_at,
      amount: p.amount,
      description: `Payment for ${bill?.billing_month ?? "—"} paid through ${
        p.payment_method ?? "Cash"
      } by ${dormerName} (Room ${dormer?.room_number ?? "N/A"})`,
    };
  });

  const formattedExpenses: RecentTransaction[] = dormExpenses.map((e) => {
    const recorder = staffFixture.find((s) => s.id === e.recorded_by);
    const recorderName = recorder
      ? `${recorder.first_name} ${recorder.last_name}`
      : "Admin";
    return {
      id: `exp-${e.id}`,
      type: "expense",
      date: e.expense_date,
      amount: e.amount,
      description: `${e.category ?? "Other"} expenses — ${e.title} (by ${recorderName})`,
    };
  });

  const recentTransactions = [...formattedPayments, ...formattedExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    dormerCount,
    totalBilled,
    totalCollected,
    outstanding: totalBilled - totalCollected,
    totalCollectibles: totalBilled - totalAmountPaid,
    totalExpenses,
    dormFundBalance: totalAmountPaid - totalExpenses,
    unpaidFinesTotal,
    recentBills: dormBills.slice(0, 5),
    recentTransactions,
  };
}

export async function getSuperAdminSnapshot(): Promise<SuperAdminDashboardSnapshot> {
  await delay();
  const current = periods.find((p) => p.is_current) ?? null;
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
  const totalBilled = bills.reduce((s, b) => s + b.total_amount_due, 0);
  const totalPaid = bills.reduce((s, b) => s + b.amount_paid, 0);

  return {
    dormitoryCount: dormitoriesFixture.filter((d) => !d.is_deleted).length,
    dormerCount: dormersFixture.length,
    totalCollected,
    outstanding: totalBilled - totalPaid,
    currentAcademicYear: current?.academic_year ?? null,
    currentSemester: current?.semester ?? null,
  };
}
