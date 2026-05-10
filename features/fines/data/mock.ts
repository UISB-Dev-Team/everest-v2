import categoriesFixture from "@/mocks/fixtures/fines.json";
import impositionsFixture from "@/mocks/fixtures/fine-impositions.json";
import dormersFixture from "@/mocks/fixtures/dormers.json";
import type {
  CreateFineCategoryInput,
  CreateFineImpositionInput,
  FineCategory,
  FineImposition,
  FineImpositionWithCategory,
  FineStatistics,
  FineSummary,
  UpdateFineCategoryInput,
  UpdateFineImpositionInput,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

let categories: FineCategory[] = categoriesFixture as FineCategory[];
let impositions: FineImposition[] = impositionsFixture as FineImposition[];

function decorate(imp: FineImposition): FineImpositionWithCategory {
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

// === Categories ===

export async function listCategoriesForDormitory(
  dormitoryId: string
): Promise<FineCategory[]> {
  await delay();
  return categories.filter(
    (c) => c.dormitory_id === dormitoryId && !c.is_deleted
  );
}

export async function createCategory(
  input: CreateFineCategoryInput
): Promise<FineCategory> {
  await delay();
  const created: FineCategory = {
    id: input.id ?? `fine-cat-mock-${Date.now()}`,
    dormitory_id: input.dormitory_id,
    name: input.name,
    description: input.description ?? null,
    amount: input.amount,
    is_deleted: false,
    recorded_by: input.recorded_by ?? null,
    created_at: input.created_at ?? new Date().toISOString(),
  };
  categories = [...categories, created];
  return created;
}

export async function updateCategory(
  id: string,
  input: UpdateFineCategoryInput
): Promise<FineCategory> {
  await delay();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error(`Fine category ${id} not found`);
  const next = { ...categories[idx], ...input, id } as FineCategory;
  categories = categories.map((c, i) => (i === idx ? next : c));
  return next;
}

export async function removeCategory(id: string): Promise<void> {
  await delay();
  categories = categories.map((c) =>
    c.id === id ? { ...c, is_deleted: true } : c
  );
}

// === Impositions ===

export async function listImpositionsForDormer(
  dormerId: string
): Promise<FineImpositionWithCategory[]> {
  await delay();
  return impositions.filter((i) => i.dormer_id === dormerId).map(decorate);
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
  const created: FineImposition = {
    id: input.id ?? `fi-mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
  impositions = [...impositions, created];
  return created;
}

export async function imposeRoomFine(
  inputs: CreateFineImpositionInput[]
): Promise<FineImposition[]> {
  const created: FineImposition[] = [];
  for (const i of inputs) created.push(await imposeFine(i));
  return created;
}

export async function updateImposition(
  id: string,
  input: UpdateFineImpositionInput
): Promise<FineImposition> {
  await delay();
  const idx = impositions.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error(`Imposition ${id} not found`);
  const next = {
    ...impositions[idx],
    ...input,
    id,
    updated_at: new Date().toISOString(),
  } as FineImposition;
  impositions = impositions.map((i, j) => (j === idx ? next : i));
  return next;
}

export async function removeImposition(id: string): Promise<void> {
  await delay();
  impositions = impositions.filter((i) => i.id !== id);
}

export async function recordFinePayment(
  id: string,
  amount: number,
  paymentMethod: string
): Promise<FineImposition> {
  await delay();
  const idx = impositions.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error(`Imposition ${id} not found`);
  const current = impositions[idx];
  const newPaid = Math.min(current.amount, current.amount_paid + amount);
  const next: FineImposition = {
    ...current,
    amount_paid: newPaid,
    payment_method: paymentMethod,
    payment_date: new Date().toISOString(),
    status: newPaid >= current.amount ? "Paid" : current.status,
    updated_at: new Date().toISOString(),
  };
  impositions = impositions.map((i, j) => (j === idx ? next : i));
  return next;
}

// === Aggregates ===

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

export async function statisticsForDormitory(
  dormitoryId: string
): Promise<FineStatistics> {
  await delay();
  const own = impositions.filter((i) => i.dormitory_id === dormitoryId);
  const totalFines = own.reduce((s, i) => s + i.amount, 0);
  const collectedFines = own.reduce((s, i) => s + i.amount_paid, 0);
  return {
    totalFines,
    collectedFines,
    collectibleFines: totalFines - collectedFines,
  };
}
