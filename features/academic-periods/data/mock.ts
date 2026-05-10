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
  return [...periods].sort((a, b) =>
    a.start_date < b.start_date ? 1 : a.start_date > b.start_date ? -1 : 0
  );
}

export async function getCurrent(): Promise<AcademicPeriod | null> {
  await delay();
  return periods.find((p) => p.is_current) ?? null;
}

export async function getById(id: string): Promise<AcademicPeriod | null> {
  await delay();
  return periods.find((p) => p.id === id) ?? null;
}

export async function create(
  input: CreateAcademicPeriodInput
): Promise<AcademicPeriod> {
  await delay();
  const created: AcademicPeriod = {
    id: input.id ?? `ap-mock-${Date.now()}`,
    academic_year: input.academic_year,
    semester: input.semester,
    start_date: input.start_date,
    end_date: input.end_date,
    is_current: input.is_current ?? false,
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
