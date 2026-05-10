import type { Tables, TablesInsert, TablesUpdate } from "@/database.types";

export type DormitoryRole = Tables<"dormitory_roles">;
export type Profile = Tables<"profiles">;

/**
 * An adviser-style staff record = profile + dormitory_roles assignment.
 * Used by the super-admin "Advisers" page (covers adviser/treasurer/auditor/sa).
 */
export interface Adviser extends Profile {
  dormitory_id: string;
  dormitory_name: string | null;
  role: DormitoryRole["role"];
  role_id: string;
  is_active: boolean;
}

export interface CreateAdviserInput {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  dormitory_id: string;
  role: DormitoryRole["role"];
}

export interface UpdateAdviserInput {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  dormitory_id?: string;
  role?: DormitoryRole["role"];
  is_active?: boolean;
}

// Re-export to keep imports together
export type { TablesInsert, TablesUpdate };
