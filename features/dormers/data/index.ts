import * as supabase from "./supabase";
import type {
  CreateDormerInput,
  Dormer,
  DormerWithBills,
  UpdateDormerInput,
} from "./types";

export interface DormersDataAccess {
  list(academicPeriodId?: string): Promise<Dormer[]>;
  listForDormitory(dormitoryId: string, academicPeriodId: string): Promise<Dormer[]>;
  listForDormitoryWithBills(dormitoryId: string, academicPeriodId: string): Promise<DormerWithBills[]>;
  getById(id: string): Promise<Dormer | null>;
  getByRoom(roomNumber: string, dormitoryId: string, academicPeriodId: string): Promise<Dormer[]>;
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
