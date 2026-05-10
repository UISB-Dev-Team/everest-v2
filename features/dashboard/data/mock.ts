import billsFixture from "@/mocks/fixtures/bills.json";
import impositionsFixture from "@/mocks/fixtures/fine-impositions.json";
import categoriesFixture from "@/mocks/fixtures/fines.json";
import dormersFixture from "@/mocks/fixtures/dormers.json";
import dormitoriesFixture from "@/mocks/fixtures/dormitories.json";
import periodsFixture from "@/mocks/fixtures/academic-periods.json";
import paymentsFixture from "@/mocks/fixtures/payments.json";
import type { Bill, Payment } from "@/features/payments/data";
import type {
  FineCategory,
  FineImposition,
  FineImpositionWithCategory,
} from "@/features/fines/data";
import type { AcademicPeriod } from "@/features/academic-periods/data";
import type {
  AdminDashboardSnapshot,
  DormerDashboardSnapshot,
  SuperAdminDashboardSnapshot,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const bills = billsFixture as Bill[];
const impositions = impositionsFixture as FineImposition[];
const categories = categoriesFixture as FineCategory[];
const payments = paymentsFixture as Payment[];
const periods = periodsFixture as AcademicPeriod[];

function decorateImposition(imp: FineImposition): FineImpositionWithCategory {
  const cat = categories.find((c) => c.id === imp.fine_id);
  const dormer = dormersFixture.find((d) => d.id === imp.dormer_id);
  return {
    ...imp,
    category_name: cat?.name ?? "Unknown",
    dormer_full_name: dormer
      ? `${dormer.first_name} ${dormer.last_name}`
      : "Unknown",
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
  const dormerCount = dormersFixture.filter(
    (d) => d.dormitory_id === dormitoryId
  ).length;

  const totalBilled = dormBills.reduce((s, b) => s + b.total_amount_due, 0);
  const totalCollected = dormPayments.reduce((s, p) => s + p.amount, 0);
  const unpaidFinesTotal = dormFines.reduce(
    (s, f) => s + (f.amount - f.amount_paid),
    0
  );

  return {
    dormerCount,
    totalBilled,
    totalCollected,
    outstanding: totalBilled - totalCollected,
    unpaidFinesTotal,
    recentBills: dormBills.slice(0, 5),
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
