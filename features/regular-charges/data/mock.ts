import fixture from "@/mocks/fixtures/regular-charges.json";
import type {
  CreateRegularChargeInput,
  RegularCharge,
  UpdateRegularChargeInput,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

let charges: RegularCharge[] = fixture as RegularCharge[];

export async function listForDormitory(
  dormitoryId: string
): Promise<RegularCharge[]> {
  await delay();
  return charges.filter((c) => c.dormitory_id === dormitoryId && !c.is_deleted);
}

export async function getById(id: string): Promise<RegularCharge | null> {
  await delay();
  return charges.find((c) => c.id === id) ?? null;
}

export async function create(
  input: CreateRegularChargeInput
): Promise<RegularCharge> {
  await delay();
  const now = new Date().toISOString();
  const created: RegularCharge = {
    id: input.id ?? `rc-mock-${Date.now()}`,
    dormitory_id: input.dormitory_id,
    name: input.name,
    description: input.description ?? null,
    amount: input.amount,
    is_deleted: false,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
  };
  charges = [...charges, created];
  return created;
}

export async function update(
  id: string,
  input: UpdateRegularChargeInput
): Promise<RegularCharge> {
  await delay();
  const idx = charges.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error(`Regular charge ${id} not found`);
  const next: RegularCharge = {
    ...charges[idx],
    ...input,
    id,
    updated_at: new Date().toISOString(),
  } as RegularCharge;
  charges = charges.map((c, i) => (i === idx ? next : c));
  return next;
}

export async function remove(id: string): Promise<void> {
  await delay();
  charges = charges.map((c) =>
    c.id === id ? { ...c, is_deleted: true } : c
  );
}
