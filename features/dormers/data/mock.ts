// import dormersFixture from "@/mocks/fixtures/dormers.json";
// import billsFixture from "@/mocks/fixtures/bills.json";
// import type {
//   CreateDormerInput,
//   Dormer,
//   DormerWithBills,
//   UpdateDormerInput,
// } from "./types";
// import type { Bill } from "@/features/payments/data";

// const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

// let dormers: Dormer[] = (dormersFixture as Dormer[]).map((d) => ({
//   ...d,
//   is_deleted: d.is_deleted ?? false,
// }));
// const bills = billsFixture as Bill[];

// export async function list(): Promise<Dormer[]> {
//   await delay();
//   return dormers.filter((d) => !d.is_deleted);
// }

// export async function listForDormitory(
//   dormitoryId: string
// ): Promise<Dormer[]> {
//   await delay();
//   return dormers.filter(
//     (d) => d.dormitory_id === dormitoryId && !d.is_deleted
//   );
// }

// export async function listForDormitoryWithBills(
//   dormitoryId: string
// ): Promise<DormerWithBills[]> {
//   await delay();
//   return dormers
//     .filter((d) => d.dormitory_id === dormitoryId && !d.is_deleted)
//     .map((d) => ({
//       ...d,
//       bills: bills
//         .filter((b) => b.dormer_id === d.id)
//         .sort((a, b) =>
//           a.billing_month < b.billing_month
//             ? 1
//             : a.billing_month > b.billing_month
//               ? -1
//               : 0
//         ),
//     }));
// }

// export async function getById(id: string): Promise<Dormer | null> {
//   await delay();
//   return dormers.find((d) => d.id === id) ?? null;
// }

// export async function create(input: CreateDormerInput): Promise<Dormer> {
//   await delay();
//   const now = new Date().toISOString();
//   const created: Dormer = {
//     id: input.id ?? `d-mock-${Date.now()}`,
//     first_name: input.first_name,
//     last_name: input.last_name,
//     email: input.email,
//     phone: input.phone ?? null,
//     is_active: input.is_active ?? true,
//     deactivation_reason: input.deactivation_reason ?? null,
//     created_at: input.created_at ?? now,
//     updated_at: input.updated_at ?? now,
//     dormitory_id: input.dormitory_id ?? null,
//     room_number: input.room_number ?? null,
//     is_deleted: false,
//   };
//   dormers = [...dormers, created];
//   return created;
// }

// export async function update(
//   id: string,
//   input: UpdateDormerInput
// ): Promise<Dormer> {
//   await delay();
//   const idx = dormers.findIndex((d) => d.id === id);
//   if (idx < 0) throw new Error(`Dormer ${id} not found`);
//   const next: Dormer = {
//     ...dormers[idx],
//     ...input,
//     id,
//     updated_at: new Date().toISOString(),
//   } as Dormer;
//   dormers = dormers.map((d, i) => (i === idx ? next : d));
//   return next;
// }

// export async function remove(id: string): Promise<void> {
//   await delay();
//   dormers = dormers.map((d) =>
//     d.id === id ? { ...d, is_deleted: true } : d
//   );
// }

// export async function importMany(
//   inputs: CreateDormerInput[]
// ): Promise<Dormer[]> {
//   const created: Dormer[] = [];
//   for (const input of inputs) {
//     created.push(await create(input));
//   }
//   return created;
// }
