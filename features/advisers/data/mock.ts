// import staffFixture from "@/mocks/fixtures/staff-profiles.json";
// import rolesFixture from "@/mocks/fixtures/dormitory-roles.json";
// import dormitoriesFixture from "@/mocks/fixtures/dormitories.json";
// import type {
//   Adviser,
//   CreateAdviserInput,
//   Profile,
//   UpdateAdviserInput,
// } from "./types";
// import type { Tables } from "@/database.types";

// type DormitoryRole = Tables<"dormitory_roles">;

// const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

// let staff: Profile[] = staffFixture as Profile[];
// let roles: DormitoryRole[] = rolesFixture as DormitoryRole[];
// const dormitories = dormitoriesFixture as Tables<"dormitories">[];

// function build(role: DormitoryRole): Adviser | null {
//   const profile = staff.find((s) => s.id === role.user_id);
//   if (!profile) return null;
//   const dormitory = dormitories.find((d) => d.id === role.dormitory_id);
//   return {
//     ...profile,
//     dormitory_id: role.dormitory_id,
//     dormitory_name: dormitory?.name ?? null,
//     role: role.role,
//     role_id: role.id,
//     is_active: role.is_active,
//   };
// }

// export async function list(): Promise<Adviser[]> {
//   await delay();
//   return roles
//     .filter((r) => r.role !== "dormer" && r.role !== "super_admin")
//     .map(build)
//     .filter((a): a is Adviser => a !== null);
// }

// export async function listForDormitory(
//   dormitoryId: string
// ): Promise<Adviser[]> {
//   await delay();
//   return roles
//     .filter(
//       (r) =>
//         r.dormitory_id === dormitoryId &&
//         r.role !== "dormer" &&
//         r.role !== "super_admin"
//     )
//     .map(build)
//     .filter((a): a is Adviser => a !== null);
// }

// export async function getById(id: string): Promise<Adviser | null> {
//   await delay();
//   const role = roles.find((r) => r.id === id);
//   return role ? build(role) : null;
// }

// export async function create(input: CreateAdviserInput): Promise<Adviser> {
//   await delay();
//   const now = new Date().toISOString();
//   const profileId = `staff-mock-${Date.now()}`;
//   const profile: Profile = {
//     id: profileId,
//     first_name: input.first_name,
//     last_name: input.last_name,
//     email: input.email,
//     phone: input.phone ?? null,
//     is_active: true,
//     deactivation_reason: null,
//     created_at: now,
//     updated_at: now,
//   };
//   const role: DormitoryRole = {
//     id: `dr-mock-${Date.now()}`,
//     user_id: profileId,
//     dormitory_id: input.dormitory_id,
//     role: input.role,
//     assigned_by: null,
//     is_active: true,
//     created_at: now,
//   };
//   staff = [...staff, profile];
//   roles = [...roles, role];
//   return build(role)!;
// }

// export async function update(input: UpdateAdviserInput): Promise<Adviser> {
//   await delay();
//   const role = roles.find((r) => r.id === input.id);
//   if (!role) throw new Error(`Adviser ${input.id} not found`);
//   const profile = staff.find((s) => s.id === role.user_id);
//   if (!profile) throw new Error("Profile missing for adviser");

//   const nextProfile: Profile = {
//     ...profile,
//     first_name: input.first_name ?? profile.first_name,
//     last_name: input.last_name ?? profile.last_name,
//     email: input.email ?? profile.email,
//     phone: input.phone ?? profile.phone,
//     updated_at: new Date().toISOString(),
//   };
//   const nextRole: DormitoryRole = {
//     ...role,
//     dormitory_id: input.dormitory_id ?? role.dormitory_id,
//     role: input.role ?? role.role,
//     is_active: input.is_active ?? role.is_active,
//   };
//   staff = staff.map((s) => (s.id === profile.id ? nextProfile : s));
//   roles = roles.map((r) => (r.id === role.id ? nextRole : r));
//   return build(nextRole)!;
// }

// export async function remove(id: string): Promise<void> {
//   await delay();
//   roles = roles.filter((r) => r.id !== id);
// }
