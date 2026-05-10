import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

export type Dormitory = Tables<"dormitories">;

/** Dormitory enriched with computed fields used by the super-admin tables. */
export interface DormitoryWithStats extends Dormitory {
  occupancy: number;
  occupancy_percentage: number;
  adviser_full_name: string | null;
}

export type CreateDormitoryInput = TablesInsert<"dormitories">;
export type UpdateDormitoryInput = TablesUpdate<"dormitories">;
