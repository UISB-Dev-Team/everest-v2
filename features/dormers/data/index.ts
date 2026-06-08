import { Bill } from "@/features/payments/data";
import * as supabase from "./supabase";
import type {
  CreateDormerInput,
  Dormer,
  DormerWithBills,
  Room,
  UpdateDormerInput,
} from "./types";

export interface DormersDataAccess {
  list(academicPeriodId?: string): Promise<Dormer[]>;
  listForDormitory(dormitoryId: string, academicPeriodId: string): Promise<Dormer[]>;
  listForDormitoryWithBills(dormitoryId: string, academicPeriodId: string): Promise<DormerWithBills[]>;
  listRoomsForDormitory(dormitoryId: string): Promise<Room[]>;
  getById(id: string): Promise<Dormer | null>;
  getByRoom(roomNumber: string, dormitoryId: string, academicPeriodId: string): Promise<Dormer[]>;
  getDormerByEmail(email: string): Promise<import('./types').DormerProfile | null>;
  getDormerBills(dormerId: string, academicPeriodId: string): Promise<Bill[]>;
  create(input: CreateDormerInput, password: string): Promise<Dormer>;
  enrollExistingDormer(
    profileId: string,
    input: Pick<CreateDormerInput, "dormitory_id" | "room_number" | "role">,
    academicPeriodId: string
  ): Promise<void>;
  update(id: string, input: UpdateDormerInput): Promise<Dormer>;
  remove(id: string): Promise<void>;
  // importMany(inputs: CreateDormerInput[]): Promise<Dormer[]>;
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
