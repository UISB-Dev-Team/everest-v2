import categoriesFixture from "@/mocks/fixtures/fines.json";
import impositionsFixture from "@/mocks/fixtures/fine-impositions.json";
import dormersFixture from "@/mocks/fixtures/dormers.json";
import type {
  CreateFineImpositionInput,
  FineCategory,
  FineImposition,
  FineImpositionWithCategory,
  FineSummary,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

const categories = categoriesFixture as FineCategory[];
const impositions = impositionsFixture as FineImposition[];

function decorate(imp: FineImposition): FineImpositionWithCategory {
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

export async function listCategoriesForDormitory(
  dormitoryId: string
): Promise<FineCategory[]> {
  await delay();
  return categories.filter(
    (c) => c.dormitory_id === dormitoryId && !c.is_deleted
  );
}

export async function listImpositionsForDormer(
  dormerId: string
): Promise<FineImpositionWithCategory[]> {
  await delay();
  return impositions
    .filter((i) => i.dormer_id === dormerId)
    .map(decorate);
}

export async function listImpositionsForDormitory(
  dormitoryId: string
): Promise<FineImpositionWithCategory[]> {
  await delay();
  return impositions
    .filter((i) => i.dormitory_id === dormitoryId)
    .map(decorate);
}

export async function imposeFine(
  input: CreateFineImpositionInput
): Promise<FineImposition> {
  await delay();
  const now = new Date().toISOString();
  return {
    id: `fi-mock-${Date.now()}`,
    fine_id: input.fine_id,
    academic_period_id: input.academic_period_id,
    dormer_id: input.dormer_id,
    dormitory_id: input.dormitory_id,
    amount: input.amount,
    amount_paid: input.amount_paid ?? 0,
    date_imposed: input.date_imposed,
    payment_date: input.payment_date ?? null,
    payment_method: input.payment_method ?? null,
    notes: input.notes ?? null,
    remarks: input.remarks ?? null,
    status: input.status ?? "Unpaid",
    imposed_by: input.imposed_by ?? null,
    recorded_by: input.recorded_by ?? null,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
  };
}

export async function summaryForDormer(
  dormerId: string
): Promise<FineSummary> {
  await delay();
  const own = impositions.filter((i) => i.dormer_id === dormerId);
  const totalAmount = own.reduce((s, i) => s + i.amount, 0);
  const totalPaid = own.reduce((s, i) => s + i.amount_paid, 0);
  return {
    totalAmount,
    totalPaid,
    remaining: totalAmount - totalPaid,
    unpaidCount: own.filter((i) => i.amount_paid < i.amount).length,
  };
}
