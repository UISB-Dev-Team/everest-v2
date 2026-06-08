import dormitoriesFixture from "@/mocks/fixtures/dormitories.json";
import dormersFixture from "@/mocks/fixtures/dormers.json";
import rolesFixture from "@/mocks/fixtures/dormitory-roles.json";
import staffFixture from "@/mocks/fixtures/staff-profiles.json";
import type {
  CreateDormitoryInput,
  Dormitory,
  DormitoryWithStats,
  UpdateDormitoryInput,
} from "./types";
import type { Tables } from "@/database.types";

type DormitoryRole = Tables<"dormitory_roles">;
type Profile = Tables<"profiles">;

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

let dormitories: Dormitory[] = dormitoriesFixture as Dormitory[];

export async function list(): Promise<Dormitory[]> {
  await delay();
  return dormitories.filter((d) => !d.is_deleted);
}

export async function listWithStats(): Promise<DormitoryWithStats[]> {
  await delay();
  const dormers = dormersFixture as { id: string; dormitory_id: string | null }[];
  const roles = rolesFixture as DormitoryRole[];
  const staff = staffFixture as Profile[];

  return dormitories
    .filter((d) => !d.is_deleted)
    .map((d) => {
      const occupancy = dormers.filter(
        (m) => m.dormitory_id === d.id
      ).length;
      const adviserRole = roles.find(
        (r) => r.dormitory_id === d.id && r.role === "adviser" && r.is_active
      );
      const adviser = adviserRole
        ? staff.find((s) => s.id === adviserRole.user_id)
        : null;
      return {
        ...d,
        occupancy,
        occupancy_percentage: d.capacity
          ? Math.round((occupancy / d.capacity) * 100)
          : 0,
        adviser_full_name: adviser
          ? `${adviser.first_name} ${adviser.last_name}`
          : null,
      };
    });
}

export async function getById(id: string): Promise<Dormitory | null> {
  await delay();
  return dormitories.find((d) => d.id === id) ?? null;
}

export async function create(
  input: CreateDormitoryInput
): Promise<Dormitory> {
  await delay();
  const now = new Date().toISOString();
  const created: Dormitory = {
    id: input.id ?? `dorm-mock-${Date.now()}`,
    name: input.name,
    capacity: input.capacity,
    location: input.location ?? null,
    is_deleted: false,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
    logo_url: ""
  };
  dormitories = [...dormitories, created];
  return created;
}

export async function update(
  id: string,
  input: UpdateDormitoryInput
): Promise<Dormitory> {
  await delay();
  const idx = dormitories.findIndex((d) => d.id === id);
  if (idx < 0) throw new Error(`Dormitory ${id} not found`);
  const next: Dormitory = {
    ...dormitories[idx],
    ...input,
    id,
    updated_at: new Date().toISOString(),
  } as Dormitory;
  dormitories = dormitories.map((d, i) => (i === idx ? next : d));
  return next;
}

export async function remove(id: string): Promise<void> {
  await delay();
  dormitories = dormitories.map((d) =>
    d.id === id ? { ...d, is_deleted: true } : d
  );
}
