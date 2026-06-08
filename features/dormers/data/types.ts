import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/database.types";

export type DormerProfile = Tables<"profiles">;
export type DormerEnrollment = Tables<"dormitory_enrollment">;
export type DormerRoleWithProfile = Tables<"dormitory_roles"> & { profiles: DormerProfile };
export type Role = Enums<"user_role_enum">;
export type Room = Tables<"rooms">
export interface Dormer extends DormerProfile {
  dormitory_id: string | null;
  room_number: string | null;
  status: string | null;
  dormer_enrollment_id: string | null;
}

export interface DormerWithBills extends Dormer {
  bills: Tables<"bills">[];
}

export type CreateDormerInput = Omit<TablesInsert<"profiles">, "id"> & {
  id?: string;
  dormitory_id?: string | null;
  room_number?: string | null;
  role: Role;
};

export type UpdateDormerInput = TablesUpdate<"profiles"> & {
  dormitory_id?: string | null;
  room_number?: string | null;
};

export type ModalType =
  | "add"
  | "bills"
  | "payment"
  | "generateBill"
  | "deleteDormer"
  | "edit"
  | "delete"
  | "import"
  | "importBills"
  | null;

export interface ImportedBill {
  email: string;
  first_name: string;
  last_name: string;
  billing_month: string;
  rowNumber: number;
  isParsingError?: boolean;
  error?: string;
}

export interface MappedBill extends ImportedBill {
  dormer_id: string;
  dormitory_id: string;
  originalIndex: number;
}
