import * as supabase from "./supabase";
import type {
  CreateDormerInput,
  Dormer,
  DormerWithBills,
  UpdateDormerInput,
} from "./types";

export interface DormersDataAccess {
  list(): Promise<Dormer[]>;
  listForDormitory(dormitoryId: string): Promise<Dormer[]>;
  listForDormitoryWithBills(dormitoryId: string): Promise<DormerWithBills[]>;
  getById(id: string): Promise<Dormer | null>;
  create(input: CreateDormerInput): Promise<Dormer>;
  update(id: string, input: UpdateDormerInput): Promise<Dormer>;
  remove(id: string): Promise<void>;
  importMany(inputs: CreateDormerInput[]): Promise<Dormer[]>;
}

export const dormersData: DormersDataAccess = supabase;

export type {
  CreateDormerInput,
  Dormer,
  DormerEnrollment,
  DormerProfile,
  DormerWithBills,
  ImportedBill,
  MappedBill,
  ModalType,
  UpdateDormerInput,
} from "./types";
