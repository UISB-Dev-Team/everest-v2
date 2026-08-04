import periodsFixture from "@/mocks/fixtures/academic-periods.json";
import type {
  AcademicPeriod,
  CreateAcademicPeriodInput,
  UpdateAcademicPeriodInput,
} from "./types";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

let periods = [...(periodsFixture as AcademicPeriod[])];

export async function list(): Promise<AcademicPeriod[]> {
  await delay();
  return [...periods]
    .filter((p) => !p.is_deleted)
    .sort((a, b) =>
      a.start_date < b.start_date ? 1 : a.start_date > b.start_date ? -1 : 0
    );
}

export async function getCurrent(): Promise<AcademicPeriod | null> {
  await delay();
  return periods.find((p) => p.is_current && !p.is_deleted) ?? null;
}

export async function getById(id: string): Promise<AcademicPeriod | null> {
  await delay();
  return periods.find((p) => p.id === id && !p.is_deleted) ?? null;
}

export async function create(
  input: CreateAcademicPeriodInput
): Promise<AcademicPeriod> {
  await delay();
  const is_current = input.is_current ?? false;
  if (is_current) {
    periods = periods.map((p) => ({ ...p, is_current: false }));
  }

  const created: AcademicPeriod = {
    id: input.id ?? `ap-mock-${Date.now()}`,
    academic_year: input.academic_year,
    semester: input.semester as "1st" | "2nd" | "Summer",
    start_date: input.start_date,
    end_date: input.end_date,
    is_current: is_current,
    is_deleted: false,
    created_at: input.created_at ?? new Date().toISOString(),
  };
  periods = [...periods, created];
  return created;
}

export async function update(
  id: string,
  input: UpdateAcademicPeriodInput
): Promise<AcademicPeriod> {
  await delay();
  const idx = periods.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error(`Academic period ${id} not found`);

  const is_current = input.is_current ?? false;
  if (is_current) {
    periods = periods.map((p, i) => (i === idx ? p : { ...p, is_current: false }));
  }

  const updated = { ...periods[idx], ...input } as AcademicPeriod;
  periods = periods.map((p, i) => (i === idx ? updated : p));
  return updated;
}

export async function setCurrent(id: string): Promise<AcademicPeriod> {
  await delay();
  periods = periods.map((p) => ({ ...p, is_current: p.id === id }));
  const target = periods.find((p) => p.id === id);
  if (!target) throw new Error(`Academic period ${id} not found`);
  return target;
}

export async function remove(id: string): Promise<void> {
  await delay();
  periods = periods.map((p) => (p.id === id ? { ...p, is_deleted: true } : p));
}
